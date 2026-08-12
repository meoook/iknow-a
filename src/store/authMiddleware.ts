import type { Middleware } from '@reduxjs/toolkit';
import { adminApi } from '../services/adminApi';
import { getCookie, removeCookie } from '../utils/cookies';
import { setAuthUser, setAuthFailed, setAuthNetworkError, logout } from './slices/authSlice';
import { wsManager } from '../services/websocket';
import type { RootState } from './index';

/**
 * Auth Middleware for admin session management:
 * 1. Initial user load on app start ONLY if cookie 'authed' === '1'.
 * 2. Reaction to login/logout endpoints.
 * 3. Polling for 'authed' cookie expiration.
 * 4. WebSocket connection lifecycle management.
 */
export const authMiddleware: Middleware = (store) => {
  let pollingInterval: ReturnType<typeof setInterval> | null = null;

  const stopPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  const startPolling = () => {
    if (pollingInterval) return;

    pollingInterval = setInterval(() => {
      const state = store.getState() as RootState;

      // If no user in state, stop polling
      if (!state.auth.user) return stopPolling();

      // If 'authed' cookie expired or was deleted, clear user session
      if (getCookie('authed') !== '1') {
        store.dispatch(logout());
        stopPolling();
      }
    }, 10000);
  };

  // Check cookie and load user data on app startup
  setTimeout(() => {
    const state = store.getState() as RootState;

    if (getCookie('authed') === '1' && !state.auth.user) {
      // @ts-ignore
      store.dispatch(adminApi.endpoints.getAuthUser.initiate(undefined, { forceRefetch: true }));
    } else {
      store.dispatch(setAuthFailed());
      if (state.auth.user) {
        startPolling();
        wsManager.connect();
      }
    }
  }, 0);

  return (next) => (action) => {
    const result = next(action);

    // Successful admin login mutation
    if (adminApi.endpoints.adminLogin.matchFulfilled(action)) {
      // @ts-ignore
      store.dispatch(adminApi.endpoints.getAuthUser.initiate(undefined, { forceRefetch: true }));
    }

    // After successful getAdminUser query
    if (adminApi.endpoints.getAuthUser.matchFulfilled(action)) {
      const userData = (action as any).payload;
      if (userData) {
        store.dispatch(setAuthUser(userData));
        startPolling();
        wsManager.connect();
      }
    }

    // If getAdminUser was rejected
    if (adminApi.endpoints.getAuthUser.matchRejected(action)) {
      const payload = (action as any).payload;
      const status = payload?.status;

      if (status === 401 || status === 403) {
        // Real Auth Failure: Remove authed cookie and redirect to login
        removeCookie('authed');
        store.dispatch(setAuthFailed());
        wsManager.disconnect();
        stopPolling();
      } else if (status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR') {
        // Network Offline or Timeout: Keep authed cookie intact!
        store.dispatch(setAuthNetworkError('network'));
      } else if (typeof status === 'number' && status >= 500) {
        // Server Error (500, 502, 503, 504): Keep authed cookie intact!
        store.dispatch(setAuthNetworkError('server'));
      } else {
        // Fallback for unexpected connection issues
        store.dispatch(setAuthNetworkError('network'));
      }
    }

    if (setAuthFailed.match(action)) {
      removeCookie('authed');
      wsManager.disconnect();
      stopPolling();
    }

    // Sign out mutation or logout action
    if (adminApi.endpoints.signOut.matchFulfilled(action) || logout.match(action)) {
      removeCookie('authed');
      wsManager.disconnect();
      store.dispatch(adminApi.util.resetApiState());
      stopPolling();
    }

    return result;
  };
};
