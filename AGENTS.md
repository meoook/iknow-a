# IKNOW Admin Panel (iknow-a) - Agent & Developer Guide

## Overview
`iknow-a` is the standalone React Admin Panel subproject for the **IKNOW** prediction platform.
It replaces Telegram bot admin workflows with a high-performance web admin dashboard with WebSocket real-time updates and modern dark aesthetic UI.

## Tech Stack
- **Framework**: React 18+ with TypeScript & Vite
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Styling**: Tailwind CSS v4 + Vanilla CSS glassmorphism system
- **Routing**: React Router v6 (`react-router-dom`)
- **Icons**: Lucide React (`lucide-react`)
- **Real-Time**: WebSockets with live badge notifications and built-in Admin Simulator

## Navigation Hierarchy
- **Дашборд** (`/`) - Platform metrics, active volume, pending moderation count, quick bank reserve overview.
- **Предсказания**:
  - **Новые** (`/predictions/new`) - `PredictionRequest` moderation queue. Includes icon regeneration, rejection with templates ("Нарушение правил сообщества", etc.) or approval into active state. Live WS red badge notification.
  - **Активные** (`/predictions/active`) - Live predictions. Search by title, sort by date & volume. Resolution modal to pick winning choice and distribute payouts.
  - **Архив** (`/predictions/archive`) - Closed predictions with results and winner tags (Read-only).
- **Финансы**:
  - **Инфо** (`/finances/info`) - Bank reserves, 100% solvency ratio, EVM/TON/Solana bank wallet balances.
  - **Транзакции** (`/finances/transactions`) - Full deposit and withdrawal ledger with search by TxHash/user and direction filters.
  - **Вывод средств** (`/finances/withdrawals`) - Manual withdrawal requests queue (`WithdrawRequest` without auto-approve). Live WS red badge notification, manual TxHash entry or auto-approval.

## State Architecture
- `store/slices/authSlice.ts`: Admin session management.
- `store/slices/predictionsSlice.ts`: Manages prediction requests, active predictions, archived predictions, icon regeneration, and resolution workflows.
- `store/slices/financeSlice.ts`: Manages bank wallets, transactions ledger, and withdrawal manual approval queue.
- `store/slices/websocketSlice.ts`: Controls real-time WebSocket connection state, event drawer history, and simulator engine.

## WebSocket Event Specification
Expected WebSocket payload format (`WsEventData`):
```json
{
  "type": "PREDICTION_REQUEST_NEW", // or "WITHDRAWAL_REQUEST_NEW"
  "timestamp": "14:22:05",
  "payload": { ... }
}
```
In development or demo mode, the header includes a "Симулятор WebSocket" button that allows instant triggering of live incoming prediction requests and withdrawal requests to verify UI badge indicators and live table updates.

## Development & Build Commands
```bash
# Start Vite development server (port 3000)
npm run dev

# Run TypeScript typecheck and build production bundle
npm run build

# Preview build
npm run preview
```
