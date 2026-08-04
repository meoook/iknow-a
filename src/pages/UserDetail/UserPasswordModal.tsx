import React from 'react';
import { KeyRound, X, Check } from 'lucide-react';

interface UserPasswordModalProps {
  isOpen: boolean;
  username: string;
  newPassword: string;
  passwordSuccess: boolean;
  onPasswordChange: (e: React.FormEvent) => void;
  onNewPasswordChange: (value: string) => void;
  onClose: () => void;
}

export const UserPasswordModal: React.FC<UserPasswordModalProps> = ({
  isOpen,
  username,
  newPassword,
  passwordSuccess,
  onPasswordChange,
  onNewPasswordChange,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
            <KeyRound size={18} />
            <span>Сменить пароль @{username}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onPasswordChange} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Введите новый пароль для пользователя:
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => onNewPasswordChange(e.target.value)}
              placeholder="Новый сложный пароль..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {passwordSuccess && (
            <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
              <Check size={14} />
              <span>Пароль успешно обновлен!</span>
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-cyan-500/20"
            >
              Сохранить пароль
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
