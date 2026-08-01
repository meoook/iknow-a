export type RequestState = 'NEW' | 'VALIDATE' | 'APPROVED' | 'REJECTED';

export type GroupTag =
  | 'POLITICS'
  | 'SPORTS'
  | 'FINANCE'
  | 'CRYPTO'
  | 'GEOPOLITICS'
  | 'TECH'
  | 'CULTURE'
  | 'WORLD'
  | 'ECONOMY'
  | 'ELECTIONS'
  | 'MENTIONS'
  | 'OTHER';

export type PredictionState = 'ACTIVE' | 'END_BET' | 'DISPUTE' | 'ENDED' | 'CANCEL';

export interface IAdminUser {
  id: number;
  username: string;
  avatar: string | null;
  is_superuser: boolean;
}

export interface IUserRef {
  id: number;
  username: string;
  avatarUrl?: string;
  telegramId?: number;
}

export interface IUserItem {
  id: number;
  username: string;
  email: string;
  balanceUsd: number;
  isActive: boolean;
  withdrawBlocked: boolean;
  createdAt: string;
  telegramId?: number;
  avatarUrl?: string;
}

export interface IPredictionRequestItem {
  id: number;
  user: IUserRef;
  moderatorId?: number;
  state: RequestState;
  rejectReason?: string;
  groups: GroupTag[];
  icon: string;
  title: string;
  choices: string[];
  choiceIcons?: Record<number, string>;
  rules: string;
  link: string;
  vote: string;
  amount: number;
  endDate: string;
  betDate: string;
  created: string;
  hasUnreadWsEvent?: boolean;
}

export interface IChoiceItem {
  id: number;
  title: string;
  volume: number;
  multiplier: number;
  win?: boolean | null;
}

export interface IPredictionItem {
  id: number;
  fromRequestId?: number;
  groups: GroupTag[];
  state: PredictionState;
  icon: string;
  title: string;
  rules: string;
  link: string;
  volume: number;
  toRefresh?: boolean;
  endDate: string;
  betDate: string;
  closed?: string | null;
  created: string;
  choices: IChoiceItem[];
}

export interface IBankWallet {
  id: string;
  chain: string;
  chainType: 'EVM' | 'TON' | 'SOL';
  address: string;
  nativeBalance: string;
  nativeSymbol: string;
  tokenBalance: string;
  tokenSymbol: string;
  usdValue: number;
  status: 'ACTIVE' | 'SYNCING' | 'WARNING';
}

export interface IBankInfo {
  bankTotalBalanceUsd: number;
  hotWalletsUsd: number;
  coldWalletsUsd: number;
  reserveRatio: number;
  twentyFourHourVolumeUsd: number;
  wallets: IBankWallet[];
}

export interface ITransactionItem {
  id: string;
  user: string;
  direction: 'IN' | 'OUT';
  type: 'DEPOSIT' | 'WITHDRAW' | 'BET_PAYOUT' | 'SWEEP';
  amount: number;
  token: string;
  chain: string;
  txHash: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  timestamp: string;
}

export interface IWithdrawalRequestItem {
  id: string;
  user: IUserRef;
  amount: number;
  token: string;
  chain: string;
  address: string;
  created: string;
  autoApproveReason: string;
  status: 'PENDING_MANUAL' | 'APPROVED' | 'REJECTED';
  txHash?: string;
  hasUnreadWsEvent?: boolean;
}

export interface IWsEventData {
  type: 'PREDICTION_REQUEST_NEW' | 'WITHDRAWAL_REQUEST_NEW' | 'PREDICTION_UPDATED' | 'TRANSACTION_NEW';
  timestamp: string;
  payload: any;
}
