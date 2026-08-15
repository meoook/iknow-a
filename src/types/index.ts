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

interface IUser {
  id: number;
  username: string;
  avatar: string | null;
}

export interface IUserAuthed extends IUser {
  is_superuser: boolean;
}

export interface IUsersInfo {
  total_users: number;
  new_users: number;
  total_balance: number;
}

export interface IUserIpLog {
  id: number;
  ip: string;
  last_used: number;
}

export interface IUserComment {
  id: number;
  prediction: string;
  text: string;
  created: number;
}

export interface IUserBet {
  id: number;
  prediction: string;
  choice: string;
  amount: number;
  multiplier: number;
  payout: number;
  state: string;
  created: number;
}

export interface IUserDepositWallet {
  id: number;
  address: string;
  chain: string;
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

export interface IUserUpdatePayload {
  id: number;
  username?: string;
  is_active?: boolean;
  withdraw_blocked?: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  password?: string;
}

interface IPredictionBase {
  id: number;
  user: IUser;
  groups: GroupTag[];
  icon: string;
  title: string;
  rules: string;
  link: string;
  vote: string;
  amount: number;
  end_date?: string;
  bet_date?: string;
  created: number;
  moderators?: string[];
}

export interface IPredictionRequestItem extends IPredictionBase {
  state: RequestState;
  reject_reason?: string;
  choices: string[];
}

interface IChoiceItem {
  id: number;
  icon: string;
  title: string;
  volume: number;
  multiplier: number;
  win: boolean | null;
}

export interface IPredictionItem extends IPredictionBase {
  state: PredictionState;
  choices: IChoiceItem[];
  volume: number;
  closed?: string | null;
}

interface ITokenInfo {
  chain: string;
  currency: string;
}

// export type ExternalTxStatus =
//   | 'PENDING'
//   | 'APPROVED'
//   | 'PROCESSING'
//   | 'SUBMITTED'
//   | 'COMPLETED'
//   | 'REJECTED'
//   | 'FAILED';

export const ExternalTxStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING',
  SUBMITTED: 'SUBMITTED',
  COMPLETED: 'COMPLETED',
  REJECTED: 'REJECTED',
  FAILED: 'FAILED',
} as const

export type ExternalTxStatus = (typeof ExternalTxStatus)[keyof typeof ExternalTxStatus]


export interface IExternalTxItem {
  id: number;
  user: IUser;
  token: ITokenInfo;
  direction: 'IN' | 'OUT';
  amount: number;
  status: ExternalTxStatus;
  tx_id: string | null;
  url: string;
  address?: string;
  created: number;
  moderators?: string[];
}

interface IFinanceToken {
  id: number;
  currency: string;
  address: string;
  active: boolean;
  decimals: number;
  minimum: number;
}

export interface IFinanceChain {
  id: number;
  name: string;
  chain_type: string;
  chain_id: number | null;
  coin: string;
  active: boolean;
  scan_url: string;
  address: string;
  expenses: number;
  tokens: IFinanceToken[];
}

interface IFinanceTxsSummary {
  in_amount: number;
  out_amount: number;
  net_amount?: number;
  in_count: number;
  out_count: number;
}

interface IFinanceBetsSummary {
  total_amount: number;
  total_count: number;
}

export interface IFinanceDashboard {
  bank_balance: number;
  bank_fee_balance: number;
  users_balance: number;
  active_bets_amount: number;
  txs_today: IFinanceTxsSummary;
  txs_total: IFinanceTxsSummary;
  bets_today: IFinanceBetsSummary;
}

