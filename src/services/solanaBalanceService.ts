import { IFinanceToken } from '../types';
import { fetchWith429Retry } from './httpUtils';

/**
 * Normalizes Solana RPC URLs (converts wss/ws to https/http)
 */
export function normalizeSolanaRpcUrl(rpcUrl: string): string {
  if (!rpcUrl) return 'https://api.mainnet-beta.solana.com';
  const trimmed = rpcUrl.trim();
  if (trimmed.startsWith('wss://')) {
    return trimmed.replace(/^wss:\/\//, 'https://');
  }
  if (trimmed.startsWith('ws://')) {
    return trimmed.replace(/^ws:\/\//, 'http://');
  }
  return trimmed.replace(/\/+$/, '');
}

/**
 * Formats a BigInt raw balance into a decimal string given decimals
 */
function formatUnits(balance: bigint, decimals: number): string {
  if (balance === 0n) return '0';
  const factor = 10n ** BigInt(decimals);
  const intPart = balance / factor;
  const remPart = balance % factor;

  if (remPart === 0n) return intPart.toString();
  const remStr = remPart.toString().padStart(decimals, '0').replace(/0+$/, '');
  return `${intPart}.${remStr}`;
}

/**
 * Fetches native SOL balance via standard Solana JSON-RPC getBalance
 */
export async function fetchSolanaNativeBalance(
  rpcUrl: string,
  walletAddress: string,
  decimals = 9
): Promise<string> {
  const url = normalizeSolanaRpcUrl(rpcUrl);
  const response = await fetchWith429Retry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'sol-native-bal',
      method: 'getBalance',
      params: [walletAddress, { commitment: 'confirmed' }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Solana RPC HTTP error: ${response.status}`);
  }

  const json = await response.json();
  if (json.error) {
    throw new Error(json.error.message || 'Solana RPC error');
  }

  const lamports = BigInt(json.result?.value ?? 0);
  return formatUnits(lamports, decimals);
}

/**
 * Fetches SPL Token balance via getTokenAccountsByOwner
 */
export async function fetchSolanaTokenBalance(
  rpcUrl: string,
  walletAddress: string,
  mintAddress: string,
  decimals = 6
): Promise<string> {
  const url = normalizeSolanaRpcUrl(rpcUrl);
  const response = await fetchWith429Retry(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'sol-token-bal',
      method: 'getTokenAccountsByOwner',
      params: [
        walletAddress,
        { mint: mintAddress },
        { encoding: 'jsonParsed', commitment: 'confirmed' },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Solana RPC HTTP error: ${response.status}`);
  }

  const json = await response.json();
  if (json.error) {
    throw new Error(json.error.message || 'Solana token RPC error');
  }

  const accounts: any[] = json.result?.value || [];
  if (accounts.length === 0) {
    return '0';
  }

  // Sum all token accounts owned by this wallet for this mint
  let totalRaw = 0n;
  for (const acc of accounts) {
    const rawAmountStr = acc.account?.data?.parsed?.info?.tokenAmount?.amount;
    if (rawAmountStr) {
      totalRaw += BigInt(rawAmountStr);
    }
  }

  return formatUnits(totalRaw, decimals);
}

export interface SolanaChainBalanceResult {
  native: string | null;
  tokens: Record<number, string | null>;
  nativeError?: string | null;
  tokenErrors?: Record<number, string>;
}

/**
 * Fetches all balances for a Solana SVM chain
 */
export async function fetchSolanaBalances(
  rpcUrl: string,
  walletAddress: string,
  nativeDecimals = 9,
  tokens: IFinanceToken[] = []
): Promise<SolanaChainBalanceResult> {
  const result: SolanaChainBalanceResult = {
    native: null,
    tokens: {},
    tokenErrors: {},
  };

  // 1. Fetch native SOL balance
  try {
    result.native = await fetchSolanaNativeBalance(rpcUrl, walletAddress, nativeDecimals);
  } catch (err: any) {
    result.nativeError = err?.message || 'Ошибка RPC Solana';
  }

  // 2. Fetch SPL tokens in parallel
  if (tokens.length > 0) {
    const tokenPromises = tokens.map(async (token) => {
      try {
        const bal = await fetchSolanaTokenBalance(
          rpcUrl,
          walletAddress,
          token.address,
          token.decimals ?? 6
        );
        result.tokens[token.id] = bal;
      } catch (err: any) {
        result.tokens[token.id] = null;
        if (result.tokenErrors) {
          result.tokenErrors[token.id] = err?.message || 'Ошибка SPL токена';
        }
      }
    });

    await Promise.allSettled(tokenPromises);
  }

  return result;
}
