import { fetchWith429Retry } from './httpUtils';

export class SolanaBalanceService {
  /**
   * Fetches native SOL balance via standard Solana JSON-RPC getBalance
   */
  static async getNativeBalance(
    rpcUrl: string,
    walletAddress: string,
    decimals = 9
  ): Promise<string> {
    const url = this.normalizeRpcUrl(rpcUrl);
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
    return this.formatUnits(lamports, decimals);
  }

  /**
   * Fetches SPL Token balance via getTokenAccountsByOwner
   */
  static async getTokenBalance(
    rpcUrl: string,
    walletAddress: string,
    mintAddress: string,
    decimals = 6
  ): Promise<string> {
    const url = this.normalizeRpcUrl(rpcUrl);
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

    return this.formatUnits(totalRaw, decimals);
  }

  // --- Private Helpers ---

  private static normalizeRpcUrl(rpcUrl: string): string {
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
