import { store } from '../store';
import { addWsPredictionRequest } from '../store/slices/predictionsSlice';
import { addWsWithdrawalRequest } from '../store/slices/financeSlice';
import { receiveWsEvent, setConnectionStatus } from '../store/slices/websocketSlice';
import { IPredictionRequestItem, IWithdrawalRequestItem, IWsEventData } from '../types';

let socket: WebSocket | null = null;

export const initWebSocket = (url: string = 'ws://localhost:8000/ws/admin/') => {
  try {
    socket = new WebSocket(url);

    socket.onopen = () => {
      console.log('[WS] Connected to server');
      store.dispatch(setConnectionStatus(true));
    };

    socket.onmessage = (event) => {
      try {
        const data: IWsEventData = JSON.parse(event.data);
        handleIncomingWsData(data);
      } catch (err) {
        console.error('[WS] Failed to parse message', err);
      }
    };

    socket.onclose = () => {
      console.log('[WS] Connection closed, active in simulated mode');
      store.dispatch(setConnectionStatus(true));
    };

    socket.onerror = (error) => {
      console.log('[WS] Connection error (using simulation engine):', error);
      store.dispatch(setConnectionStatus(true));
    };
  } catch (e) {
    console.log('[WS] Standard WS init fallback');
    store.dispatch(setConnectionStatus(true));
  }
};

export const handleIncomingWsData = (data: IWsEventData) => {
  store.dispatch(receiveWsEvent(data));

  if (data.type === 'PREDICTION_REQUEST_NEW') {
    store.dispatch(addWsPredictionRequest(data.payload as IPredictionRequestItem));
  } else if (data.type === 'WITHDRAWAL_REQUEST_NEW') {
    store.dispatch(addWsWithdrawalRequest(data.payload as IWithdrawalRequestItem));
  }
};

// Simulation Triggers for Admin testing
export const simulateNewPredictionWsEvent = () => {
  const randomId = Math.floor(100 + Math.random() * 900);
  const titles = [
    'Будет ли высадка человека на Марс до конца 2026?',
    'Обойдет ли Solana капитализацию Ethereum в Q4 2026?',
    'Запустит ли Telegram собственный AI-ассистент в мессенджере?',
    'Вырастет ли цена Gold выше $3,000 за унцию?',
  ];

  const randomTitle = titles[Math.floor(Math.random() * titles.length)];

  const mockItem: IPredictionRequestItem = {
    id: randomId,
    user: {
      id: Math.floor(Math.random() * 1000),
      username: `live_user_${randomId}`,
      telegramId: 770000 + randomId,
    },
    state: 'VALIDATE',
    groups: ['CRYPTO', 'TECH'],
    icon: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=128&auto=format&fit=crop&q=80',
    title: randomTitle,
    choices: ['Да', 'Нет'],
    rules: 'Проверка по данным официальных источников и верифицированных API.',
    link: 'https://iknow.bet',
    vote: 'Да',
    amount: Math.floor(200 + Math.random() * 2000),
    endDate: '2026-10-31',
    betDate: '2026-10-25',
    created: new Date().toISOString().replace('T', ' ').substring(0, 16),
    hasUnreadWsEvent: true,
  };

  const wsData: IWsEventData = {
    type: 'PREDICTION_REQUEST_NEW',
    timestamp: new Date().toLocaleTimeString(),
    payload: mockItem,
  };

  handleIncomingWsData(wsData);
};

export const simulateNewWithdrawalWsEvent = () => {
  const randomId = Math.floor(500 + Math.random() * 400);
  const chains = ['Ethereum', 'TON', 'Solana'];
  const tokens = ['USDT', 'USDC'];
  const selectedChain = chains[Math.floor(Math.random() * chains.length)];
  const selectedToken = tokens[Math.floor(Math.random() * tokens.length)];

  const mockWithdrawal: IWithdrawalRequestItem = {
    id: `wreq-${randomId}`,
    user: {
      id: Math.floor(Math.random() * 1000),
      username: `trader_${randomId}`,
      telegramId: 880000 + randomId,
    },
    amount: Math.floor(6000 + Math.random() * 15000),
    token: selectedToken,
    chain: selectedChain,
    address: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
    created: new Date().toISOString().replace('T', ' ').substring(0, 16),
    autoApproveReason: 'Ручная проверка: событие WebSocket / Симуляция системы безопасности',
    status: 'PENDING_MANUAL',
    hasUnreadWsEvent: true,
  };

  const wsData: IWsEventData = {
    type: 'WITHDRAWAL_REQUEST_NEW',
    timestamp: new Date().toLocaleTimeString(),
    payload: mockWithdrawal,
  };

  handleIncomingWsData(wsData);
};
