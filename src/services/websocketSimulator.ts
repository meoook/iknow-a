import { store } from '../store';
import { addWsPredictionRequest } from '../store/slices/predictionsSlice';
import { addWsWithdrawalRequest } from '../store/slices/financeSlice';
import { receiveWsEvent, setConnectionStatus } from '../store/slices/websocketSlice';
import { IPredictionRequestItem, IWithdrawalRequestItem, IWsEventData } from '../types';

let socket: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;

export const initWebSocket = (customUrl?: string) => {
  const url = import.meta.env.VITE_WS_URL || 'ws://localhost/ws'

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
      console.log('[WS] Connection closed. Retrying in 5s...');
      store.dispatch(setConnectionStatus(false));
      reconnectTimer = setTimeout(() => {
        initWebSocket(url);
      }, 5000);
    };

    socket.onerror = (error) => {
      console.warn('[WS] WebSocket error:', error);
      store.dispatch(setConnectionStatus(false));
    };
  } catch (e) {
    console.error('[WS] Init failed', e)
    store.dispatch(setConnectionStatus(false))
  }
}

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
  if (eventType === 'admin.request.created' || eventType === 'PREDICTION_REQUEST_NEW') {
    if (payload) {
      store.dispatch(addWsPredictionRequest({ ...payload, hasUnreadWsEvent: true } as IPredictionRequestItem));
    }
  } else if (eventType === 'admin.withdrawal.created' || eventType === 'WITHDRAWAL_REQUEST_NEW') {
    if (payload) {
      store.dispatch(addWsWithdrawalRequest({ ...payload, hasUnreadWsEvent: true } as IWithdrawalRequestItem));
    }
  }
};


