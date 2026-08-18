import { IFinanceChain, IFinanceToken, TChainType } from '../types';
import { EvmBalanceService } from './evmBalanceService';
import { TronBalanceService } from './tronBalanceService';
import { SolanaBalanceService } from './solanaBalanceService';

export class ChainBalanceService {
  /**
   * Fetches native coin balance for a given blockchain network
   */
  static async getNativeBalance(chain: IFinanceChain): Promise<string> {
    if (!chain.rpc_url || !chain.address) {
      throw new Error('Отсутствует RPC URL или адрес кошелька');
    }

    const type = chain.chain_type?.trim().toUpperCase();

    switch (type) {
      case TChainType.EVM:
        return EvmBalanceService.getNativeBalance(
          chain.rpc_url,
          chain.address,
          chain.decimals ?? 18
        );
      case TChainType.TVM:
        return TronBalanceService.getNativeBalance(
          chain.rpc_url,
          chain.address,
          chain.decimals ?? 6
        );
      case TChainType.SVM:
        return SolanaBalanceService.getNativeBalance(
          chain.rpc_url,
          chain.address,
          chain.decimals ?? 9
        );
      default:
        throw new Error(`Неподдерживаемый тип сети: ${chain.chain_type}`);
    }
  }

  /**
   * Fetches token balance (ERC-20, TRC-20, SPL) for a given contract/mint
   */
  static async getTokenBalance(
    chain: IFinanceChain,
    token: IFinanceToken
  ): Promise<string> {
    if (!chain.rpc_url || !chain.address || !token.address) {
      throw new Error('Отсутствуют параметры для запроса баланса токена');
    }

    const type = chain.chain_type?.trim().toUpperCase();

    switch (type) {
      case TChainType.EVM:
        return EvmBalanceService.getTokenBalance(
          chain.rpc_url,
          chain.address,
          token.address,
          token.decimals ?? 18
        );
      case TChainType.TVM:
        return TronBalanceService.getTokenBalance(
          chain.rpc_url,
          chain.address,
          token.address,
          token.decimals ?? 6
        );
      case TChainType.SVM:
        return SolanaBalanceService.getTokenBalance(
          chain.rpc_url,
          chain.address,
          token.address,
          token.decimals ?? 6
        );
      default:
        throw new Error(`Неподдерживаемый тип сети: ${chain.chain_type}`);
    }
  }

  /**
   * Checks if chain belongs to supported balance RPC architectures (EVM, TVM, SVM)
   */
  static isSupported(chain: IFinanceChain): boolean {
    const type = chain.chain_type?.trim().toUpperCase();
    return Object.values(TChainType).includes(type as (typeof TChainType)[keyof typeof TChainType]);
  }

  /**
   * Formats a decimal string into a readable balance presentation with comma thousands separators
   */
  static formatBalance(value: string | null | undefined, maxDecimals = 4): string {
    if (value === null || value === undefined) return '—';
    // if (value === '0x' || value === '0x0') return '0.00';
    const num = parseFloat(value);
    if (isNaN(num)) return '—';

    if (num === 0) return '0.00';

    const parts = value.split('.');
    const intPart = parseInt(parts[0], 10).toLocaleString('en-US');

    if (!parts[1]) {
      return `${intPart}.00`;
    }

    let decPart = parts[1].slice(0, maxDecimals);
    if (decPart.length === 1) decPart += '0';

    return `${intPart}.${decPart}`;
  }
}
