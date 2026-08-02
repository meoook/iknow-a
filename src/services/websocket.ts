import { store } from '../store';
import {
  addWsPredictionRequest,
  updateWsPredictionRequest,
  setRequestModerator,
} from '../store/slices/predictionsSlice';
import { addWsWithdrawalRequest } from '../store/slices/financeSlice';
import { receiveWsEvent, setConnectionStatus } from '../store/slices/websocketSlice';
import { IPredictionRequestItem, IWithdrawalRequestItem, IWsEventData } from '../types';

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export const closeWebSocket = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  if (socket) {
    socket.onopen = null;
    socket.onmessage = null;
    socket.onclose = null;
    socket.onerror = null;
    if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
      socket.close();
    }
    socket = null;
    store.dispatch(setConnectionStatus(false));
  }
};

export const initWebSocket = (customUrl?: string) => {
  // Prevent duplicate connections if socket is already open or connecting
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return;
  }

  // Close any stale socket before initializing new one
  closeWebSocket();

  const url = customUrl || import.meta.env.VITE_WS_URL || 'ws://localhost/ws';

  try {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('[WS] WebSocket connected:', url);
      store.dispatch(setConnectionStatus(true));
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    socket.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        handleIncomingWsData(raw);
      } catch (err) {
        console.error('[WS] Failed to parse message', err);
      }
    };

    socket.onclose = () => {
      console.log('[WS] Connection closed.');
      store.dispatch(setConnectionStatus(false));
      socket = null;

      // Reconnect only if user is still authenticated
      if (!reconnectTimer && store.getState().auth.isAuthenticated) {
        reconnectTimer = setTimeout(() => {
          reconnectTimer = null;
          initWebSocket(url);
        }, 5000);
      }
    };

    socket.onerror = (error) => {
      console.warn('[WS] WebSocket error:', error);
      store.dispatch(setConnectionStatus(false));
    };
  } catch (e) {
    console.error('[WS] Init failed', e);
    store.dispatch(setConnectionStatus(false));
  }
};

export const sendWsMessage = (message: object) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(message));
  }
};

export const handleIncomingWsData = (data: any) => {
  const eventType = data.type || data.event;
  const payload = data.value || data.payload;

  const wsEventData: IWsEventData = {
    type: eventType,
    timestamp: new Date().toLocaleTimeString(),
    payload: payload,
  };

  store.dispatch(receiveWsEvent(wsEventData));

  // Handle Backend Admin Realtime Events
  if (eventType === 'request.created') {
    if (payload) {
      store.dispatch(addWsPredictionRequest({ ...payload, hasUnreadWsEvent: true } as IPredictionRequestItem));
    }
  } else if (eventType === 'request.updated') {
    if (payload) {
      store.dispatch(updateWsPredictionRequest(payload));
    }
  } else if (eventType === 'admin.request.taken' || eventType === 'request.taken') {
    if (payload) {
      store.dispatch(setRequestModerator(payload));
    }
  } else if (eventType === 'withdrawal.created') {
    if (payload) {
      store.dispatch(addWsWithdrawalRequest({ ...payload, hasUnreadWsEvent: true } as IWithdrawalRequestItem));
    }
  }
};
