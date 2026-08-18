import { fetchWith429Retry } from './httpUtils';

export class TronBalanceService {
  private static readonly ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

  /**
   * Fetches native TRX balance using TronGrid v1 or Tron fullnode JSON RPC
   */
  static async getNativeBalance(rpcUrl: string, walletAddress: string, decimals = 6): Promise<string> {
    const url = this.normalizeRpcUrl(rpcUrl);

    try {
      const res = await fetchWith429Retry(`${url}/v1/accounts/${walletAddress}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          const rawSun = BigInt(json.data[0].balance || 0);
          return this.formatUnits(rawSun, decimals);
        }
        return '0';
      }
    } catch {
      // Fallback to /wallet/getaccount
    }

    const resFallback = await fetchWith429Retry(`${url}/wallet/getaccount`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: walletAddress, visible: true }),
    });

    if (!resFallback.ok) {
      throw new Error(`Tron RPC error: ${resFallback.status}`);
    }

    const json = await resFallback.json();
    const rawSun = BigInt(json.balance || 0);
    return this.formatUnits(rawSun, decimals);
  }

  /**
   * Fetches TRC-20 token balance via triggerconstantcontract balanceOf
   */
  static async getTokenBalance(
    rpcUrl: string,
    walletAddress: string,
    tokenAddress: string,
    decimals = 6
  ): Promise<string> {
    const url = this.normalizeRpcUrl(rpcUrl);
    const parameter = this.encodeAddressParameter(walletAddress);

    const res = await fetchWith429Retry(`${url}/wallet/triggerconstantcontract`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        owner_address: walletAddress,
        contract_address: tokenAddress,
        function_selector: 'balanceOf(address)',
        parameter,
        visible: true,
      }),
    });

    if (!res.ok) {
      throw new Error(`Tron TRC-20 RPC error: ${res.status}`);
    }

    const json = await res.json();
    if (json.result && json.result.result === false) {
      const msg = json.result.message
        ? Buffer.from(json.result.message, 'hex').toString('utf8')
        : 'Ошибка контракта';
      throw new Error(msg || 'Tron contract error');
    }

    const hexResult = json.constant_result?.[0];
    if (!hexResult) {
      return '0';
    }

    const rawBalance = BigInt(`0x${hexResult}`);
    return this.formatUnits(rawBalance, decimals);
  }

  // --- Private Helpers ---

  private static normalizeRpcUrl(rpcUrl: string): string {
    if (!rpcUrl) return 'https://api.trongrid.io';
    const trimmed = rpcUrl.trim();
    if (trimmed.startsWith('wss://')) {
      return trimmed.replace(/^wss:\/\//, 'https://');
    }
    if (trimmed.startsWith('ws://')) {
      return trimmed.replace(/^ws:\/\//, 'http://');
    }
    return trimmed.replace(/\/+$/, '');
  }

  private static base58Decode(str: string): Uint8Array {
    const bytes = [0];
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      const val = this.ALPHABET.indexOf(char);
      if (val === -1) throw new Error(`Недопустимый символ Base58: ${char}`);
      for (let j = 0; j < bytes.length; j++) {
        bytes[j] *= 58;
      }
      bytes[0] += val;
      let carry = 0;
      for (let j = 0; j < bytes.length; j++) {
        bytes[j] += carry;
        carry = bytes[j] >> 8;
        bytes[j] &= 0xff;
      }
      while (carry > 0) {
        bytes.push(carry & 0xff);
        carry >>= 8;
      }
    }
    for (let i = 0; i < str.length && str[i] === '1'; i++) {
      bytes.push(0);
    }
    return new Uint8Array(bytes.reverse());
  }

  private static encodeAddressParameter(base58Address: string): string {
    const decoded = this.base58Decode(base58Address);
    if (decoded.length !== 25) {
      throw new Error(`Некорректный адрес Tron: ${base58Address}`);
    }
    // Tron addresses: 1 byte prefix (0x41) + 20 bytes address payload + 4 bytes checksum
    const addressPayload = decoded.slice(1, 21);
    const hex = Array.from(addressPayload)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hex.padStart(64, '0');
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
