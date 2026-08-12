import React, { useEffect } from 'react';
import { WifiOff, ServerCrash, RotateCcw, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '../../store';
import { retryAuthCheck } from '../../store/slices/authSlice';
import { adminApi } from '../../services/adminApi';

interface AuthNetworkErrorScreenProps {
  type: 'network' | 'server';
}

export const AuthNetworkErrorScreen: React.FC<AuthNetworkErrorScreenProps> = ({ type }) => {
  const dispatch = useAppDispatch();

  const handleRetry = () => {
    dispatch(retryAuthCheck());
    // @ts-ignore
    dispatch(adminApi.endpoints.getAuthUser.initiate(undefined, { forceRefetch: true }));
  };

  useEffect(() => {
    const handleOnline = () => {
      handleRetry();
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const isNetwork = type === 'network';

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 max-w-md w-full glass-panel shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          {isNetwork ? <WifiOff className="w-8 h-8" /> : <ServerCrash className="w-8 h-8" />}
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold tracking-tight text-white">
            {isNetwork ? 'Нет подключения к сети' : 'Сервер временно недоступен'}
          </h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isNetwork
              ? 'Не удалось проверить сессию администратора. Проверьте интернет-соединение.'
              : 'Сервер вернул ошибку при проверке сессии. Попробуйте повторить попытку позже.'}
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 text-left">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-[11px] text-slate-300">
            Маркер сессии сохранен. Вводить логин и пароль заново не требуется.
          </p>
        </div>

        <button
          onClick={handleRetry}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-slate-950 px-5 py-3 rounded-xl text-xs font-extrabold shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Повторить попытку</span>
        </button>
      </div>
    </div>
  );
};
