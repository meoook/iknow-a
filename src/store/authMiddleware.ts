import type { Middleware } from '@reduxjs/toolkit';
import { adminApi } from '../services/adminApi';
import { getCookie } from '../utils/cookies';
import { setAuthUser, setAuthFailed, logout } from './slices/authSlice';
import type { RootState } from './index';

/**
 * Auth Middleware for admin session management:
 * 1. Initial user load on app start ONLY if cookie 'authed' === '1'.
 * 2. Reaction to login/logout endpoints.
 * 3. Polling for 'authed' cookie expiration.
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
      store.dispatch(adminApi.endpoints.getAdminUser.initiate(undefined, { forceRefetch: true }));
    } else {
      store.dispatch(setAuthFailed());
      if (state.auth.user) startPolling();
    }
  }, 0);

  return (next) => (action) => {
    const result = next(action);

    // Successful admin login mutation
    if (adminApi.endpoints.adminLogin.matchFulfilled(action)) {
      // @ts-ignore
      store.dispatch(adminApi.endpoints.getAdminUser.initiate(undefined, { forceRefetch: true }));
    }

    // After successful getAdminUser query
    if (adminApi.endpoints.getAdminUser.matchFulfilled(action)) {
      const userData = (action as any).payload;
      if (userData) {
        store.dispatch(setAuthUser(userData));
        startPolling();
      }
    }

    // If getAdminUser was rejected (401 / 403)
    if (adminApi.endpoints.getAdminUser.matchRejected(action)) {
      store.dispatch(setAuthFailed());
      stopPolling();
    }

    // Sign out mutation
    if (adminApi.endpoints.signOut.matchFulfilled(action)) {
      store.dispatch(logout());
      stopPolling();
    }

    return result;
  };
};
