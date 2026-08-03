import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  IPredictionRequestItem,
  IPredictionItem,
  RequestState,
} from '../../types';
import {
  initialPredictionRequests,
  initialActivePredictions,
  initialArchivePredictions,
} from '../../data/mockData';

interface IPredictionsState {
  requests: IPredictionRequestItem[];
  active: IPredictionItem[];
  archive: IPredictionItem[];
  hasUnreadNewRequests: boolean;
}

// Generates high quality random tech/crypto icons for re-generating icon feature
const ICON_POOL = [
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=128&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=128&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?w=128&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&auto=format&fit=crop&q=80',
];

const initialState: IPredictionsState = {
  requests: [],
  active: initialActivePredictions,
  archive: initialArchivePredictions,
  hasUnreadNewRequests: false,
};

export const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    setPredictionRequests: (state, action: PayloadAction<IPredictionRequestItem[]>) => {
      const existingUnreads = new Set(state.requests.filter((r) => r.hasUnreadWsEvent).map((r) => r.id));
      const existingModerators = new Map(state.requests.map((r) => [r.id, r.moderators]));

      state.requests = action.payload
        .filter((r) => r.state === 'VALIDATE')
        .map((r) => ({
          ...r,
          hasUnreadWsEvent: existingUnreads.has(r.id),
          moderators: existingModerators.get(r.id) || r.moderators,
        }));

      state.hasUnreadNewRequests = state.requests.some((r) => r.hasUnreadWsEvent);
    },
    approveRequest: (state, action: PayloadAction<number>) => {
      const reqId = action.payload;
      const req = state.requests.find((r) => r.id === reqId);
      if (req) {
        req.state = 'APPROVED';
        req.hasUnreadWsEvent = false;

        // Move to active predictions
        const newActivePrediction: IPredictionItem = {
          id: Date.now(),
          fromRequestId: req.id,
          groups: req.groups,
          state: 'ACTIVE',
          icon: req.icon,
          title: req.title,
          rules: req.rules,
          link: req.link,
          volume: req.amount,
          endDate: String(req.end_date || req.endDate || ''),
          betDate: String(req.bet_date || req.betDate || ''),
          created: new Date().toISOString().split('T')[0],
          choices: req.choices.map((c, idx) => ({
            id: Date.now() + idx,
            title: c,
            volume: idx === 0 ? req.amount : 0,
            multiplier: 2.0,
          })),
        };

        state.active.unshift(newActivePrediction);
        state.requests = state.requests.filter((r) => r.id !== reqId);
      }
      state.hasUnreadNewRequests = state.requests.some((r) => r.hasUnreadWsEvent);
    },

    rejectRequest: (
      state,
      action: PayloadAction<{ id: number; reason: string }>
    ) => {
      const { id, reason } = action.payload;
      const req = state.requests.find((r) => r.id === id);
      if (req) {
        req.state = 'REJECTED';
        req.rejectReason = reason;
        req.hasUnreadWsEvent = false;
        state.requests = state.requests.filter((r) => r.id !== id);
      }
      state.hasUnreadNewRequests = state.requests.some((r) => r.hasUnreadWsEvent);
    },

    regenerateIcon: (state, action: PayloadAction<number>) => {
      const req = state.requests.find((r) => r.id === action.payload);
      if (req) {
        const nextIcon = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
        req.icon = req.icon || nextIcon;
      }
    },

    regenerateChoiceIcon: (
      state,
      action: PayloadAction<{ requestId: number; choiceIndex: number }>
    ) => {
      const { requestId, choiceIndex } = action.payload;
      const req = state.requests.find((r) => r.id === requestId);
      if (req) {
        if (!req.choiceIcons) req.choiceIcons = {};
        req.choiceIcons[choiceIndex] = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
      }
    },

    regenerateAllChoiceIcons: (state, action: PayloadAction<number>) => {
      const req = state.requests.find((r) => r.id === action.payload);
      if (req) {
        if (!req.choiceIcons) req.choiceIcons = {};
        req.choices.forEach((_, idx) => {
          req.choiceIcons![idx] = ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)];
        });
      }
    },

    clearNewRequestsBadge: (state) => {
      state.requests.forEach((r) => {
        r.hasUnreadWsEvent = false;
      });
      state.hasUnreadNewRequests = false;
    },

    resolveActivePrediction: (
      state,
      action: PayloadAction<{ predictionId: number; winningChoiceId: number }>
    ) => {
      const { predictionId, winningChoiceId } = action.payload;
      const predIndex = state.active.findIndex((p) => p.id === predictionId);

      if (predIndex !== -1) {
        const target = state.active[predIndex];
        target.state = 'ENDED';
        target.closed = new Date().toISOString().split('T')[0];
        target.choices.forEach((ch) => {
          ch.win = ch.id === winningChoiceId;
        });

        state.archive.unshift(target);
        state.active.splice(predIndex, 1);
      }
    },

    addWsPredictionRequest: (state, action: PayloadAction<IPredictionRequestItem>) => {
      const newItem = {
        ...action.payload,
        hasUnreadWsEvent: true,
      };
      state.requests.unshift(newItem);
      state.hasUnreadNewRequests = true;
    },

    updateWsPredictionRequest: (
      state,
      action: PayloadAction<Partial<IPredictionRequestItem> & { params?: Partial<IPredictionRequestItem> }>
    ) => {
      const { id, params, ...directProps } = action.payload;
      const targetState = params?.state || directProps.state;
      if (id !== undefined && (targetState === 'APPROVED' || targetState === 'REJECTED')) {
        state.requests = state.requests.filter((r) => r.id !== id);
      } else if (id !== undefined) {
        const req = state.requests.find((r) => r.id === id);
        if (req) {
          Object.assign(req, directProps, params);
        }
      }
    },
    setRequestModerator: (
      state,
      action: PayloadAction<{ id: number; moderator: string }>
    ) => {
      const { id, moderator } = action.payload;
      const req = state.requests.find((r) => r.id === id);
      if (req && moderator) {
        if (!req.moderators) {
          req.moderators = [];
        }
        if (!req.moderators.includes(moderator)) {
          req.moderators.push(moderator);
        }
      }
    },
  },
});

export const {
  setPredictionRequests,
  approveRequest,
  rejectRequest,
  regenerateIcon,
  regenerateChoiceIcon,
  regenerateAllChoiceIcons,
  clearNewRequestsBadge,
  resolveActivePrediction,
  addWsPredictionRequest,
  updateWsPredictionRequest,
  setRequestModerator,
} = predictionsSlice.actions;

export default predictionsSlice.reducer;
