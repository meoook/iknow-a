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

export interface IAdminUsersInfo {
  total_users: number;
  new_users: number;
  total_balance: number;
}

export interface IUserRef {
  id: number;
  username: string;
  avatarUrl?: string;
  telegramId?: number;
}

export interface IUserDepositWallet {
  chain: string;
  address: string;
}

export interface IUserIpActivity {
  id: string;
  ip: string;
  device: string;
  location: string;
  timestamp: string;
}

export interface IAdminUserIpLog {
  id: number;
  ip: string;
  last_used: number;
}

export interface IAdminUserComment {
  id: number;
  prediction: string;
  text: string;
  created: number;
}

export interface IAdminUserBet {
  id: number;
  prediction: string;
  choice: string;
  amount: number;
  multiplier: number;
  payout: number;
  state: string;
  created: number;
}

export interface IAdminUserDepositWallet {
  id: number;
  address: string;
  chain: string;
}

export interface IUserMessageActivity {
  id: string;
  topic: string;
  message: string;
  timestamp: string;
}

export interface IUserBetActivity {
  id: string;
  predictionTitle: string;
  choice: string;
  amount: number;
  multiplier: number;
  status: 'WIN' | 'LOSS' | 'PENDING';
  timestamp: string;
}

export interface IUserItem {
  id: number;
  username: string;
  email?: string;
  address?: string;
  balance: number;
  is_active: boolean;
  withdraw_blocked: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  created: number | string;
  telegram_id?: number;
  avatar?: string | null;
}

export interface IAdminUserUpdatePayload {
  id: number;
  is_active?: boolean;
  withdraw_blocked?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  password?: string;
}

export interface IPredictionRequestItem {
  id: number;
  user: IUserRef;
  moderators?: string[];
  state: RequestState;
  reject_reason?: string;
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
  end_date?: string;
  endDate?: string;
  bet_date?: string;
  betDate?: string;
  created: number | string;
}

export interface IChoiceItem {
  id: number;
  icon?: string | null;
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
  moderators?: string[];
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

export interface ITokenInfo {
  chain: string;
  currency: string;
}

export interface IObjectUser {
  id: number;
  username: string;
  avatar: string | null;
}

export type ExternalTxStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'PROCESSING'
  | 'SUBMITTED'
  | 'COMPLETED'
  | 'REJECTED'
  | 'FAILED';

export interface IExternalTxItem {
  id: number;
  user?: IObjectUser;
  token?: ITokenInfo;
  direction: 'IN' | 'OUT';
  amount: number;
  status: ExternalTxStatus;
  tx_id?: string;
  url: string;
  address?: string;
  created: number;
  moderators?: string[];
}

export type ITransactionItem = IExternalTxItem;
export type IWithdrawalRequestItem = IExternalTxItem;



