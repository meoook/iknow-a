import { useState, useEffect, useCallback, useRef } from 'react';
import { IFinanceChain, IFinanceToken } from '../types';
import { ChainBalanceService } from '../services/chainBalanceService';

export interface TokenBalanceState {
  balance: string | null;
  isLoading: boolean;
  error?: string | null;
}

export interface ChainBalanceState {
  native: string | null;
  isNativeLoading: boolean;
  nativeError?: string | null;
  tokens: Record<number, TokenBalanceState>;
}

export function useChainBalances(chains: IFinanceChain[] | undefined) {
  const [balances, setBalances] = useState<Record<number, ChainBalanceState>>({});
  const [isGlobalFetching, setIsGlobalFetching] = useState<boolean>(false);

  const isMountedRef = useRef(true);
  // Tracks which chain native and token balances have already been fetched on mount
  const initializedKeysRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Refreshes native coin balance for a specific chain
   */
  const refreshChainNative = useCallback(async (chain: IFinanceChain) => {
    if (!ChainBalanceService.isSupported(chain)) return;

    setBalances((prev) => ({
      ...prev,
      [chain.id]: {
        native: prev[chain.id]?.native ?? null,
        isNativeLoading: true,
        nativeError: null,
        tokens: prev[chain.id]?.tokens ?? {},
      },
    }));

    try {
      const balance = await ChainBalanceService.getNativeBalance(chain);
      if (!isMountedRef.current) return;

      setBalances((prev) => ({
        ...prev,
        [chain.id]: {
          ...prev[chain.id],
          native: balance,
          isNativeLoading: false,
          nativeError: null,
        },
      }));
    } catch (err: any) {
      if (!isMountedRef.current) return;

      setBalances((prev) => ({
        ...prev,
        [chain.id]: {
          ...prev[chain.id],
          isNativeLoading: false,
          nativeError: err?.message || 'Ошибка RPC',
        },
      }));
    }
  }, []);

  /**
   * Refreshes balance for a specific token contract
   */
  const refreshToken = useCallback(async (chain: IFinanceChain, token: IFinanceToken) => {
    if (!ChainBalanceService.isSupported(chain)) return;

    setBalances((prev) => {
      const currentChain = prev[chain.id] || {
        native: null,
        isNativeLoading: false,
        tokens: {},
      };

      return {
        ...prev,
        [chain.id]: {
          ...currentChain,
          tokens: {
            ...currentChain.tokens,
            [token.id]: {
              balance: currentChain.tokens[token.id]?.balance ?? null,
              isLoading: true,
              error: null,
            },
          },
        },
      };
    });

    try {
      const balance = await ChainBalanceService.getTokenBalance(chain, token);
      if (!isMountedRef.current) return;

      setBalances((prev) => {
        const currentChain = prev[chain.id] || {
          native: null,
          isNativeLoading: false,
          tokens: {},
        };

        return {
          ...prev,
          [chain.id]: {
            ...currentChain,
            tokens: {
              ...currentChain.tokens,
              [token.id]: {
                balance,
                isLoading: false,
                error: null,
              },
            },
          },
        };
      });
    } catch (err: any) {
      if (!isMountedRef.current) return;

      setBalances((prev) => {
        const currentChain = prev[chain.id] || {
          native: null,
          isNativeLoading: false,
          tokens: {},
        };

        return {
          ...prev,
          [chain.id]: {
            ...currentChain,
            tokens: {
              ...currentChain.tokens,
              [token.id]: {
                balance: currentChain.tokens[token.id]?.balance ?? null,
                isLoading: false,
                error: err?.message || 'Ошибка токена',
              },
            },
          },
        };
      });
    }
  }, []);

  /**
   * Global refresh for all supported chains and tokens
   */
  const refetchAll = useCallback(async () => {
    if (!chains || chains.length === 0) return;
    const supported = chains.filter((c) => ChainBalanceService.isSupported(c));
    if (supported.length === 0) return;

    setIsGlobalFetching(true);

    const promises: Promise<void>[] = [];

    supported.forEach((chain) => {
      promises.push(refreshChainNative(chain));
      if (chain.tokens) {
        chain.tokens.forEach((token) => {
          promises.push(refreshToken(chain, token));
        });
      }
    });

    await Promise.allSettled(promises);
    if (isMountedRef.current) {
      setIsGlobalFetching(false);
    }
  }, [chains, refreshChainNative, refreshToken]);

  // Initial granular fetch when chains are loaded (independent request per chain & per token)
  useEffect(() => {
    if (!chains || chains.length === 0) return;

    const supported = chains.filter((c) => ChainBalanceService.isSupported(c));

    supported.forEach((chain) => {
      const nativeKey = `chain-native-${chain.id}`;
      if (!initializedKeysRef.current.has(nativeKey)) {
        initializedKeysRef.current.add(nativeKey);
        refreshChainNative(chain);
      }

      if (chain.tokens && chain.tokens.length > 0) {
        chain.tokens.forEach((token) => {
          const tokenKey = `token-${token.id}`;
          if (!initializedKeysRef.current.has(tokenKey)) {
            initializedKeysRef.current.add(tokenKey);
            refreshToken(chain, token);
          }
        });
      }
    });
  }, [chains, refreshChainNative, refreshToken]);

  return {
    balances,
    isGlobalFetching,
    refetchAll,
    refreshChainNative,
    refreshToken,
  };
}
