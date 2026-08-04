import React from 'react';
import { IUserItem } from '../../types';

interface UserAdminActionsProps {
  user: IUserItem;
  isSuperuserLogged: boolean;
  onToggleActive: () => void;
  onToggleWithdrawBlocked: () => void;
  onToggleStaff: () => void;
  onToggleSuperuser: () => void;
}

export const UserAdminActions: React.FC<UserAdminActionsProps> = ({
  user,
  isSuperuserLogged,
  onToggleActive,
  onToggleWithdrawBlocked,
  onToggleStaff,
  onToggleSuperuser,
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-center">
      <div>
        <div className="space-y-3">
          {/* Active Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 text-xs block">Активен (isActive)</span>
              <span className="text-[10px] text-slate-400">
                {user.is_active ? 'Разрешен вход' : 'Заблокирован'}
              </span>
            </div>
            <button
              onClick={onToggleActive}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                user.is_active ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.is_active ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Withdraw Blocked Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            <div>
              <span className="font-bold text-slate-200 text-xs block">Запрет вывода</span>
              <span className="text-[10px] text-slate-400">
                {user.withdraw_blocked ? 'Вывод заблокирован' : 'Вывод разрешен'}
              </span>
            </div>
            <button
              onClick={onToggleWithdrawBlocked}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                user.withdraw_blocked ? 'bg-rose-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.withdraw_blocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Staff Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!isSuperuserLogged ? 'opacity-50' : ''}`}>
            <div>
              <span className="font-bold text-slate-200 text-xs block">Персонал (is_staff)</span>
              <span className="text-[10px] text-slate-400">
                {user.is_staff ? 'Доступ к админке' : 'Обычный юзер'}
                {!isSuperuserLogged && ' (Нужен Superuser)'}
              </span>
            </div>
            <button
              disabled={!isSuperuserLogged}
              onClick={onToggleStaff}
              title={!isSuperuserLogged ? 'Только суперпользователь может менять роль персонала' : ''}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !isSuperuserLogged
                  ? 'cursor-not-allowed bg-slate-800'
                  : user.is_staff
                    ? 'bg-cyan-500 cursor-pointer'
                    : 'bg-slate-700 cursor-pointer'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.is_staff ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Superuser Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!isSuperuserLogged ? 'opacity-50' : ''}`}>
            <div>
              <span className="font-bold text-slate-200 text-xs block">Суперпользователь</span>
              <span className="text-[10px] text-slate-400">
                {user.is_superuser ? 'Полные права' : 'Ограничен'}
                {!isSuperuserLogged && ' (Нужен Superuser)'}
              </span>
            </div>
            <button
              disabled={!isSuperuserLogged}
              onClick={onToggleSuperuser}
              title={!isSuperuserLogged ? 'Только суперпользователь может менять роль суперпользователя' : ''}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !isSuperuserLogged
                  ? 'cursor-not-allowed bg-slate-800'
                  : user.is_superuser
                    ? 'bg-purple-500 cursor-pointer'
                    : 'bg-slate-700 cursor-pointer'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.is_superuser ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
