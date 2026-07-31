import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IWsEventData } from '../../types';

interface IWebSocketState {
  isConnected: boolean;
  lastEvent: IWsEventData | null;
  history: IWsEventData[];
  simulationCount: number;
}

const initialState: IWebSocketState = {
  isConnected: true,
  lastEvent: null,
  history: [],
  simulationCount: 0,
};

export const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    receiveWsEvent: (state, action: PayloadAction<IWsEventData>) => {
      state.lastEvent = action.payload;
      state.history.unshift(action.payload);
      if (state.history.length > 50) {
        state.history.pop();
      }
      state.simulationCount += 1;
    },
  },
});

export const { setConnectionStatus, receiveWsEvent } = websocketSlice.actions;
export default websocketSlice.reducer;
