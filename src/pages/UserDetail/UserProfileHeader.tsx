import React from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Copy,
  Check,
  Clock,
  Mail,
  Send,
  QrCode,
} from 'lucide-react';
import { IUserItem } from '../../types';
import { formatDisplayDate } from '../../utils/dates';

interface UserProfileHeaderProps {
  user: IUserItem;
  copiedText: string | null;
  onCopy: (text: string) => void;
}

export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  user,
  copiedText,
  onCopy,
}) => {
  return (
    <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-6 shadow-xl">
      {/* Avatar & Username Row */}
      <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center font-black text-xl text-cyan-400 shrink-0 shadow-lg">
          {user.username[0].toUpperCase()}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100">@{user.username}</h1>
            <span className="text-xs text-slate-500 font-mono">ID: #{user.id}</span>
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            {user.is_superuser && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-400 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md uppercase">
                <ShieldAlert size={10} />
                <span>Superuser</span>
              </span>
            )}
            {user.is_staff && (
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-md uppercase">
                <span>Staff</span>
              </span>
            )}
            {user.is_active ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                <CheckCircle2 size={10} />
                <span>Активен</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-md">
                <XCircle size={10} />
                <span>Заблокирован</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* User Info Fields - Vertical Column */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Основная информация аккаунта
        </h3>

        <div className="divide-y divide-slate-800/80 bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden text-xs">
          {/* Email Row */}
          <div className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Mail size={14} className="text-cyan-400" />
              <span>Почта (Email)</span>
            </div>
            <div className="font-mono text-slate-200">
              {user.email ? (
                <span>{user.email}</span>
              ) : (
                <span className="text-slate-500 italic">Не указана</span>
              )}
            </div>
          </div>

          {/* Telegram Row */}
          <div className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Send size={14} className="text-cyan-400" />
              <span>Telegram ID</span>
            </div>
            <div className="font-mono text-slate-200">
              {user.telegram_id ? (
                <span>@{user.telegram_id}</span>
              ) : (
                <span className="text-slate-500 italic">Не привязан</span>
              )}
            </div>
          </div>

          {/* Login Address Row */}
          <div className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <QrCode size={14} className="text-cyan-400" />
              <span>Адрес для входа (Login Wallet)</span>
            </div>
            <div className="font-mono text-slate-200">
              {user.address ? (
                <div
                  onClick={() => onCopy(user.address!)}
                  className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/50 px-3 py-1 rounded-lg cursor-pointer transition-all group"
                  title="Кликните в любом месте, чтобы скопировать адрес"
                >
                  <span className="truncate max-w-[200px] sm:max-w-xs text-xs">{user.address}</span>
                  {copiedText === user.address ? (
                    <Check size={14} className="text-emerald-400 shrink-0" />
                  ) : (
                    <Copy size={14} className="text-slate-400 group-hover:text-cyan-400 transition-colors shrink-0" />
                  )}
                </div>
              ) : (
                <span className="text-slate-500 italic">Не привязан</span>
              )}
            </div>
          </div>

          {/* Date Joined Row */}
          <div className="p-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400 font-medium">
              <Clock size={14} className="text-cyan-400" />
              <span>Дата регистрации</span>
            </div>
            <div className="font-mono text-slate-200">
              {formatDisplayDate(user.created)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
