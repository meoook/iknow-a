import { IFinanceChain, IFinanceToken } from '../types';
import {
  fetchEvmNativeBalance,
  fetchEvmTokenBalance,
  isEvmChain,
  formatBalanceDisplay,
} from './evmBalanceService';
import {
  fetchTronNativeBalance,
  fetchTronTrc20Balance,
} from './tronBalanceService';
import {
  fetchSolanaNativeBalance,
  fetchSolanaTokenBalance,
} from './solanaBalanceService';

export { formatBalanceDisplay, isEvmChain };

export type SupportedChainType = 'EVM' | 'TVM' | 'SVM';

/**
 * Checks if chain belongs to supported RPC balance query architectures (EVM, TVM, SVM)
 */
export function isSupportedChain(chain: IFinanceChain): boolean {
  const type = chain.chain_type?.trim().toUpperCase();
  return type === 'EVM' || type === 'TVM' || type === 'SVM';
}

export function isTronChain(chain: IFinanceChain): boolean {
  return chain.chain_type?.trim().toUpperCase() === 'TVM';
}

export function isSolanaChain(chain: IFinanceChain): boolean {
  return chain.chain_type?.trim().toUpperCase() === 'SVM';
}

/**
 * Fetches native coin balance for a given chain (EVM, TVM, SVM)
 */
export async function fetchChainNativeBalance(chain: IFinanceChain): Promise<string> {
  if (!chain.rpc_url || !chain.address) {
    throw new Error('Отсутствует RPC URL или адрес кошелька');
  }

  const type = chain.chain_type?.trim().toUpperCase();

  if (type === 'EVM') {
    return fetchEvmNativeBalance(chain.rpc_url, chain.address, chain.decimals ?? 18);
  }

  if (type === 'TVM') {
    return fetchTronNativeBalance(chain.rpc_url, chain.address, chain.decimals ?? 6);
  }

  if (type === 'SVM') {
    return fetchSolanaNativeBalance(chain.rpc_url, chain.address, chain.decimals ?? 9);
  }

  throw new Error(`Неподдерживаемый тип сети: ${chain.chain_type}`);
}

/**
 * Fetches single token balance for a given chain and token contract/mint
 */
export async function fetchSingleTokenBalance(
  chain: IFinanceChain,
  token: IFinanceToken
): Promise<string> {
  if (!chain.rpc_url || !chain.address || !token.address) {
    throw new Error('Отсутствуют параметры для запроса баланса токена');
  }

  const type = chain.chain_type?.trim().toUpperCase();

  if (type === 'EVM') {
    return fetchEvmTokenBalance(
      chain.rpc_url,
      chain.address,
      token.address,
      token.decimals ?? 18
    );
  }

  if (type === 'TVM') {
    return fetchTronTrc20Balance(
      chain.rpc_url,
      chain.address,
      token.address,
      token.decimals ?? 6
    );
  }

  if (type === 'SVM') {
    return fetchSolanaTokenBalance(
      chain.rpc_url,
      chain.address,
      token.address,
      token.decimals ?? 6
    );
  }

  throw new Error(`Неподдерживаемый тип сети: ${chain.chain_type}`);
}
