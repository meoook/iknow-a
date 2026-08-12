import { store } from '../store';
import {
  wsRequestSetModerator,
  wsRequestUnsetModerator,
  wsRequestUpdateIcon,
  addWsNewRequestEvent,
  addWsDisputeEvent,
  removePredictionRequest,
  removePrediction,
  wsPredictionSetModerator,
  wsPredictionUnsetModerator,
} from '../store/slices/predictionsSlice';
import { addWsWithdrawalRequest } from '../store/slices/financeSlice';
import { receiveWsEvent, setConnectionStatus } from '../store/slices/websocketSlice';
import { adminApi } from './adminApi';
import { IWithdrawalRequestItem, IWsEventData } from '../types';

const WsOutEvent = {
  request_join: 'request.join',
  request_left: 'request.left',
  prediction_join: 'prediction.join',
  prediction_left: 'prediction.left',
} as const
type WsOutEvent = (typeof WsOutEvent)[keyof typeof WsOutEvent]

const WsInEvent = {
  request_created: 'request.created',
  request_taken: 'request.taken',
  request_dropped: 'request.dropped',
  request_updated: 'request.updated',
  request_verdict: 'request.verdict',
  prediction_dispute: 'prediction.dispute',
  prediction_close: 'prediction.close',
  prediction_taken: 'prediction.taken',
  prediction_dropped: 'prediction.dropped',
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
      store.dispatch(addWsNewRequestEvent());
      if (msg.value) store.dispatch(adminApi.endpoints.getRequestById.initiate(msg.value));
    }
    else if (msg.type === WsInEvent.request_taken) store.dispatch(wsRequestSetModerator(msg.value));
    else if (msg.type === WsInEvent.request_dropped) store.dispatch(wsRequestUnsetModerator(msg.value));
    else if (msg.type === WsInEvent.request_updated) {
      if (msg.value?.id && msg.value?.data?.icon) {
        store.dispatch(wsRequestUpdateIcon({ id: msg.value.id, icon: msg.value.data.icon }));
      }
    }
    else if (msg.type === WsInEvent.request_verdict) {
      if (msg.value) store.dispatch(removePredictionRequest(msg.value));
    }
    else if (msg.type === WsInEvent.prediction_dispute) {
      store.dispatch(addWsDisputeEvent());
      if (msg.value) store.dispatch(adminApi.endpoints.getPredictionById.initiate(msg.value));
    }
    else if (msg.type === WsInEvent.prediction_close) {
      if (msg.value) store.dispatch(removePrediction(msg.value));
    }
    else if (msg.type === WsInEvent.prediction_taken) {
      if (msg.value) store.dispatch(wsPredictionSetModerator(msg.value));
    }
    else if (msg.type === WsInEvent.prediction_dropped) {
      if (msg.value) store.dispatch(wsPredictionUnsetModerator(msg.value));
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
  requestLeave(requestId: number) {
    this.send(WsOutEvent.request_left, requestId);
  }
  predictionJoin(predictionId: number) {
    this.send(WsOutEvent.prediction_join, predictionId);
  }
  predictionLeave(predictionId: number) {
    this.send(WsOutEvent.prediction_left, predictionId);
  }
}

export const wsManager = new WebSocketManager()
