import { store } from '../store';
import {
  wsRequestUpdate,
  wsRequestVerdict,
  wsRequestSetModerator,
  wsRequestNew,
  addWsDisputeEvent,
} from '../store/slices/predictionsSlice';
import { addWsWithdrawalRequest } from '../store/slices/financeSlice';
import { receiveWsEvent, setConnectionStatus } from '../store/slices/websocketSlice';
import { adminApi } from './adminApi';
import { IWithdrawalRequestItem, IWsEventData } from '../types';

const WsOutEvent = {
  request_join: 'request.join',
} as const
type WsOutEvent = (typeof WsOutEvent)[keyof typeof WsOutEvent]

const WsInEvent = {
  request_created: 'request.created',
  request_taken: 'request.taken',
  request_updated: 'request.updated',
  request_verdict: 'request.verdict',
  prediction_dispute: 'prediction.dispute',
  withdraw: 'withdraw'
} as const
type WsInEvent = (typeof WsInEvent)[keyof typeof WsInEvent]

interface WsInMessage {
  type: WsInEvent
  value?: any
}

class WebSocketManager {
  private ws: WebSocket | null = null
  private reconnectTimer: NodeJS.Timeout | null = null
  private queue: { type: WsOutEvent; value: any }[] = []

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.CONNECTING || this.ws.readyState === WebSocket.OPEN)) return
    this.disconnect();  // Close any stale socket before initializing new one

    try {
      this.ws = new WebSocket(import.meta.env.VITE_WS_URL);

      this.ws.onopen = () => {
        console.log('[WS] Connected');
        store.dispatch(setConnectionStatus(true));
        this.clearTimer();
        this.flushQueue();
      };

      this.ws.onmessage = (event) => {
        try {
          const msg: WsInMessage = JSON.parse(event.data)
          this.handleMessage(msg)
        } catch (error) {
          console.error('[WS] Failed to parse message', error);

        }
      };

      this.ws.onclose = () => {
        console.log('[WS] Connection closed');
        store.dispatch(setConnectionStatus(false));
        this.ws = null;
        this.reconnect()
      };

      this.ws.onerror = (error) => {
        console.warn('[WS] WebSocket error:', error);
        store.dispatch(setConnectionStatus(false));
      };
    } catch (e) {
      console.error('[WS] Init failed', e);
      store.dispatch(setConnectionStatus(false));
      this.reconnect();
    }
  }

  disconnect() {
    this.clearTimer()
    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onclose = null;
      this.ws.onerror = null;
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) this.ws.close();
      this.ws = null;
      store.dispatch(setConnectionStatus(false));
    }
  }

  private reconnect() {
    this.clearTimer()
    if (!store.getState().auth.isAuthenticated) return

    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, 5000)
  }

  private clearTimer() {
    if (!this.reconnectTimer) return
    clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private flushQueue() {
    if (this.queue.length) console.log(`[WS] Flushing queue (${this.queue.length} messages)`)
    while (this.queue.length > 0) {
      const msg = this.queue.shift()
      if (msg) this.send(msg.type, msg.value)
    }
  }

  private handleMessage(msg: WsInMessage) {
    if (msg.type === WsInEvent.request_created) {
      store.dispatch(wsRequestNew());
      store.dispatch(adminApi.util.invalidateTags(['PredictionRequests']));
    }
    else if (msg.type === WsInEvent.request_taken) store.dispatch(wsRequestSetModerator(msg.value));
    else if (msg.type === WsInEvent.request_updated) store.dispatch(wsRequestUpdate(msg.value));
    else if (msg.type === WsInEvent.request_verdict) store.dispatch(wsRequestVerdict(msg.value));
    else if (msg.type === WsInEvent.prediction_dispute) {
      store.dispatch(addWsDisputeEvent());
      store.dispatch(adminApi.util.invalidateTags(['AdminPredictions']));
    }
    else if (msg.type === WsInEvent.withdraw) {
      store.dispatch(addWsWithdrawalRequest(msg.value));
      store.dispatch(adminApi.util.invalidateTags(['Withdraw']));
    }
    else console.log('[WS] Unknown message type', msg.type)
  }

  private send(type: WsOutEvent, value: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, value }))
    } else {
      console.log(`[WS] Not connected. Queueing message: ${type}`)
      this.queue.push({ type, value })
    }
  }

  requestJoin(requestId: number) {
    this.send(WsOutEvent.request_join, requestId);
  }
}

export const wsManager = new WebSocketManager()

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
  if (eventType === 'a.request.created') {
    store.dispatch(wsRequestNew());
    store.dispatch(adminApi.util.invalidateTags(['PredictionRequests']));
  } else if (eventType === 'request.updated') {
    if (payload) {
      store.dispatch(wsRequestUpdate(payload));
    }
  } else if (eventType === 'prediction.dispute') {
    store.dispatch(addWsDisputeEvent());
    store.dispatch(adminApi.util.invalidateTags(['AdminPredictions']));
  } else if (eventType === 'admin.request.taken' || eventType === 'request.taken') {
    if (payload) {
      store.dispatch(wsRequestSetModerator(payload));
    }
  } else if (eventType === 'withdrawal.created') {
    if (payload) {
      store.dispatch(addWsWithdrawalRequest({ ...payload, hasUnreadWsEvent: true } as IWithdrawalRequestItem));
    }
  }
};

