import {
  createPublicClient,
  http,
  erc20Abi,
  formatUnits,
  isAddress,
  type Address,
  type PublicClient,
} from 'viem';
import { IFinanceChain } from '../types';
import { fetchWith429Retry } from './httpUtils';

/**
 * Normalizes RPC URLs, converting WebSocket URLs (wss/ws) to HTTP/HTTPS for stateless RPC calls
 */
export function normalizeRpcUrl(rpcUrl: string): string {
  if (!rpcUrl) return '';
  const trimmed = rpcUrl.trim();
  if (trimmed.startsWith('wss://')) {
    return trimmed.replace(/^wss:\/\//, 'https://');
  }
  if (trimmed.startsWith('ws://')) {
    return trimmed.replace(/^ws:\/\//, 'http://');
  }
  return trimmed;
}

/**
 * Checks if the given chain is an EVM network
 */
export function isEvmChain(chain: IFinanceChain): boolean {
  return chain.chain_type?.trim().toUpperCase() === 'EVM';
}

// Client cache by normalized RPC URL to avoid recreating clients repeatedly
const clientCache = new Map<string, PublicClient>();

function getPublicClient(rpcUrl: string): PublicClient {
  const normalized = normalizeRpcUrl(rpcUrl);
  let client = clientCache.get(normalized);
  if (!client) {
    client = createPublicClient({
      transport: http(normalized, {
        timeout: 15_000,
        retryCount: 2,
        retryDelay: 5000,
        fetchFn: fetchWith429Retry,
      }),
    });
    clientCache.set(normalized, client);
  }
  return client;
}

/**
 * Fetches native coin balance (e.g. ETH, BNB, POL) for an address
 */
export async function fetchEvmNativeBalance(
  rpcUrl: string,
  walletAddress: string,
  decimals = 18
): Promise<string> {
  if (!walletAddress || !isAddress(walletAddress)) {
    throw new Error(`Некорректный адрес кошелька: ${walletAddress}`);
  }

  const client = getPublicClient(rpcUrl);
  const rawBalance = await client.getBalance({
    address: walletAddress as Address,
  });

  return formatUnits(rawBalance, decimals);
}

/**
 * Fetches ERC-20 token balance via smart-contract balanceOf function
 */
export async function fetchEvmTokenBalance(
  rpcUrl: string,
  walletAddress: string,
  tokenAddress: string,
  decimals = 18
): Promise<string> {
  if (!walletAddress || !isAddress(walletAddress)) {
    throw new Error(`Некорректный адрес кошелька: ${walletAddress}`);
  }
  if (!tokenAddress || !isAddress(tokenAddress)) {
    throw new Error(`Некорректный адрес смарт-контракта: ${tokenAddress}`);
  }

  const client = getPublicClient(rpcUrl);
  const rawBalance = await client.readContract({
    address: tokenAddress as Address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress as Address],
  });

  return formatUnits(rawBalance, decimals);
}

export interface ChainBalanceResult {
  native: string | null;
  tokens: Record<number, string | null>;
  nativeError?: string | null;
  tokenErrors?: Record<number, string>;
}

/**
 * Fetches all balances (native + tokens) for a given EVM chain
 */
export async function fetchChainBalances(chain: IFinanceChain): Promise<ChainBalanceResult | null> {
  if (!isEvmChain(chain) || !chain.rpc_url || !chain.address) {
    return null;
  }

  const result: ChainBalanceResult = {
    native: null,
    tokens: {},
    tokenErrors: {},
  };

  // Fetch native balance
  try {
    const nativeBal = await fetchEvmNativeBalance(
      chain.rpc_url,
      chain.address,
      chain.decimals ?? 18
    );
    result.native = nativeBal;
  } catch (err: any) {
    result.nativeError = err?.message || 'Ошибка получения нативного баланса';
  }

  // Fetch tokens balance in parallel
  if (chain.tokens && chain.tokens.length > 0) {
    const tokenPromises = chain.tokens.map(async (token) => {
      try {
        const tokenBal = await fetchEvmTokenBalance(
          chain.rpc_url,
          chain.address,
          token.address,
          token.decimals ?? 18
        );
        result.tokens[token.id] = tokenBal;
      } catch (err: any) {
        result.tokens[token.id] = null;
        if (result.tokenErrors) {
          result.tokenErrors[token.id] = err?.message || 'Ошибка контракта';
        }
      }
    });

    await Promise.allSettled(tokenPromises);
  }

  return result;
}

/**
 * Formats a decimal string into a readable balance presentation with comma thousands separators
 */
export function formatBalanceDisplay(value: string | null | undefined, maxDecimals = 4): string {
  if (value === null || value === undefined) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';

  if (num === 0) return '0.00';

  // Format with thousands separator and reasonable decimal precision
  const parts = value.split('.');
  const intPart = parseInt(parts[0], 10).toLocaleString('en-US');

  if (!parts[1]) {
    return `${intPart}.00`;
  }

  let decPart = parts[1].slice(0, maxDecimals);
  // Pad with zero if only 1 decimal digit
  if (decPart.length === 1) decPart += '0';

  return `${intPart}.${decPart}`;
}
