import { createSlice, createEntityAdapter, PayloadAction } from '@reduxjs/toolkit';
import { IPredictionRequestItem, IPredictionItem } from '../../types';
import { RootState } from '../index';

export const requestsAdapter = createEntityAdapter<IPredictionRequestItem>({
  sortComparer: (a, b) => b.id - a.id,
});

export const predictionsAdapter = createEntityAdapter<IPredictionItem>({
  sortComparer: (a, b) => b.id - a.id,
});

const initialState = {
  requests: requestsAdapter.getInitialState(),
  predictions: predictionsAdapter.getInitialState(),
  hasUnreadNewRequests: false,
  hasUnreadDispute: false,
  unreadDisputeCount: 0,
};

export const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    // Requests Adapter Reducers
    setPredictionRequests: (state, action: PayloadAction<IPredictionRequestItem[]>) => {
      const filtered = action.payload.filter((r) => r.state === 'VALIDATE');
      requestsAdapter.setAll(state.requests, filtered);
    },
    upsertPredictionRequest: (state, action: PayloadAction<IPredictionRequestItem>) => {
      requestsAdapter.upsertOne(state.requests, action.payload);
    },
    removePredictionRequest: (state, action: PayloadAction<number>) => {
      requestsAdapter.removeOne(state.requests, action.payload);
    },
    updatePredictionRequest: (state, action: PayloadAction<{ id: number; changes: Partial<IPredictionRequestItem> }>) => {
      requestsAdapter.updateOne(state.requests, action.payload);
    },

    // Predictions Adapter Reducers
    setPredictions: (state, action: PayloadAction<IPredictionItem[]>) => {
      predictionsAdapter.setAll(state.predictions, action.payload);
    },
    upsertPrediction: (state, action: PayloadAction<IPredictionItem>) => {
      predictionsAdapter.upsertOne(state.predictions, action.payload);
    },
    removePrediction: (state, action: PayloadAction<number>) => {
      predictionsAdapter.removeOne(state.predictions, action.payload);
    },
    updatePrediction: (state, action: PayloadAction<{ id: number; changes: Partial<IPredictionItem> }>) => {
      predictionsAdapter.updateOne(state.predictions, action.payload);
    },

    // UI Badges & Lamp Flags
    addWsNewRequestEvent: (state) => {
      state.hasUnreadNewRequests = true;
    },
    clearNewRequestsBadge: (state) => {
      state.hasUnreadNewRequests = false;
    },
    addWsDisputeEvent: (state) => {
      state.hasUnreadDispute = true;
      state.unreadDisputeCount += 1;
    },
    clearDisputeBadge: (state) => {
      state.hasUnreadDispute = false;
      state.unreadDisputeCount = 0;
    },

    // Moderation & WS helpers
    wsRequestSetModerator: (state, action: PayloadAction<{ id: number; moderator: string }>) => {
      const { id, moderator } = action.payload;
      const req = state.requests.entities[id];
      if (req && moderator) {
        const moderators = req.moderators ? [...req.moderators] : [];
        if (!moderators.includes(moderator)) {
          moderators.push(moderator);
          requestsAdapter.updateOne(state.requests, { id, changes: { moderators } });
        }
      }
    },
    wsRequestUnsetModerator: (state, action: PayloadAction<{ id: number; moderator: string }>) => {
      const { id, moderator } = action.payload;
      const req = state.requests.entities[id];
      if (req && moderator && req.moderators) {
        const moderators = req.moderators.filter((m) => m !== moderator);
        requestsAdapter.updateOne(state.requests, { id, changes: { moderators } });
      }
    },
    wsRequestUpdateIcon: (state, action: PayloadAction<{ id: number; icon: string }>) => {
      const { id, icon } = action.payload;
      const cleanIcon = icon.split('?')[0];
      const versionedIcon = `${cleanIcon}?v=${Date.now()}`;
      requestsAdapter.updateOne(state.requests, { id, changes: { icon: versionedIcon } });
    },
    wsPredictionSetModerator: (state, action: PayloadAction<{ id: number; moderator: string }>) => {
      const { id, moderator } = action.payload;
      const pred = state.predictions.entities[id];
      if (pred && moderator) {
        const moderators = pred.moderators ? [...pred.moderators] : [];
        if (!moderators.includes(moderator)) {
          moderators.push(moderator);
          predictionsAdapter.updateOne(state.predictions, { id, changes: { moderators } });
        }
      }
    },
    wsPredictionUnsetModerator: (state, action: PayloadAction<{ id: number; moderator: string }>) => {
      const { id, moderator } = action.payload;
      const pred = state.predictions.entities[id];
      if (pred && moderator && pred.moderators) {
        const moderators = pred.moderators.filter((m) => m !== moderator);
        predictionsAdapter.updateOne(state.predictions, { id, changes: { moderators } });
      }
    },
  },
});

export const {
  setPredictionRequests,
  upsertPredictionRequest,
  removePredictionRequest,
  updatePredictionRequest,
  setPredictions,
  upsertPrediction,
  removePrediction,
  updatePrediction,
  addWsNewRequestEvent,
  clearNewRequestsBadge,
  addWsDisputeEvent,
  clearDisputeBadge,
  wsRequestSetModerator,
  wsRequestUnsetModerator,
  wsRequestUpdateIcon,
  wsPredictionSetModerator,
  wsPredictionUnsetModerator,
} = predictionsSlice.actions;

// Entity Selectors
export const requestsSelectors = requestsAdapter.getSelectors<RootState>(
  (state) => state.predictions.requests
);

export const predictionsSelectors = predictionsAdapter.getSelectors<RootState>(
  (state) => state.predictions.predictions
);

export default predictionsSlice.reducer;
