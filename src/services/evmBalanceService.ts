import { fetchWith429Retry } from './httpUtils';

export class EvmBalanceService {
  /**
   * Fetches native coin balance (e.g. ETH, BNB, POL) for an EVM address via JSON-RPC eth_getBalance
   */
  static async getNativeBalance(
    rpcUrl: string,
    walletAddress: string,
    decimals = 18
  ): Promise<string> {
    if (!walletAddress || !this.isAddress(walletAddress)) {
      throw new Error(`Некорректный адрес кошелька: ${walletAddress}`);
    }

    const url = this.normalizeRpcUrl(rpcUrl);
    const response = await fetchWith429Retry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'evm-native-bal',
        method: 'eth_getBalance',
        params: [walletAddress, 'latest'],
      }),
    });

    if (!response.ok) {
      throw new Error(`EVM RPC HTTP error: ${response.status}`);
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message || 'EVM RPC error');
    }

    const hexResult = json.result;
    if (!hexResult || hexResult === '0x') {
      return '0';
    }

    const rawBalance = BigInt(hexResult);
    return this.formatUnits(rawBalance, decimals);
  }

  /**
   * Fetches ERC-20 token balance via JSON-RPC eth_call (balanceOf selector: 0x70a08231)
   */
  static async getTokenBalance(
    rpcUrl: string,
    walletAddress: string,
    tokenAddress: string,
    decimals = 18
  ): Promise<string> {
    if (!walletAddress || !this.isAddress(walletAddress)) {
      throw new Error(`Некорректный адрес кошелька: ${walletAddress}`);
    }
    if (!tokenAddress || !this.isAddress(tokenAddress)) {
      throw new Error(`Некорректный адрес смарт-контракта: ${tokenAddress}`);
    }

    const url = this.normalizeRpcUrl(rpcUrl);
    // ABI encoding: balanceOf(address) -> selector 0x70a08231 + 32-byte left-padded address
    const cleanAddress = walletAddress.toLowerCase().replace(/^0x/, '');
    const data = `0x70a08231${cleanAddress.padStart(64, '0')}`;

    const response = await fetchWith429Retry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'evm-token-bal',
        method: 'eth_call',
        params: [
          {
            to: tokenAddress,
            data,
          },
          'latest',
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`EVM RPC HTTP error: ${response.status}`);
    }

    const json = await response.json();
    if (json.error) {
      throw new Error(json.error.message || 'EVM token RPC error');
    }

    const hexResult = json.result;
    if (!hexResult || hexResult === '0x') {
      return '0';
    }

    const rawBalance = BigInt(hexResult);
    return this.formatUnits(rawBalance, decimals);
  }

  // --- Private Helpers ---

  private static isAddress(address: string): boolean {
    return /^0x[0-9a-fA-F]{40}$/.test(address);
  }

  private static normalizeRpcUrl(rpcUrl: string): string {
    if (!rpcUrl) return '';
    const trimmed = rpcUrl.trim();
    if (trimmed.startsWith('wss://')) {
      return trimmed.replace(/^wss:\/\//, 'https://');
    }
    if (trimmed.startsWith('ws://')) {
      return trimmed.replace(/^ws:\/\//, 'http://');
    }
    return trimmed.replace(/\/+$/, '');
  }

  private static formatUnits(balance: bigint, decimals: number): string {
    if (balance === 0n) return '0';
    const factor = 10n ** BigInt(decimals);
    const intPart = balance / factor;
    const remPart = balance % factor;

    if (remPart === 0n) return intPart.toString();
    const remStr = remPart.toString().padStart(decimals, '0').replace(/0+$/, '');
    return `${intPart}.${remStr}`;
  }
}
