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
  const isTargetAdmin = user.is_staff || user.is_superuser;
  const canEditStatus = isSuperuserLogged || !isTargetAdmin;

  return (
    <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel space-y-4 shadow-xl flex flex-col justify-center">
      <div>
        <div className="space-y-3">
          {/* Active Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!canEditStatus ? 'opacity-50' : ''}`}>
            <div>
              <span className="font-bold text-slate-200 text-xs block">Активен</span>
              <span className="text-[10px] text-slate-400">
                {user.is_active ? 'Разрешен вход' : 'Заблокирован'}
                {!canEditStatus && ' (Нужен Суперадмин)'}
              </span>
            </div>
            <button
              disabled={!canEditStatus}
              onClick={onToggleActive}
              title={!canEditStatus ? 'Только суперадмин может менять статус администраторов' : ''}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !canEditStatus
                  ? 'cursor-not-allowed bg-slate-800'
                  : user.is_active
                    ? 'bg-emerald-500 cursor-pointer'
                    : 'bg-slate-700 cursor-pointer'
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
          <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!canEditStatus ? 'opacity-50' : ''}`}>
            <div>
              <span className="font-bold text-slate-200 text-xs block">Запрет вывода</span>
              <span className="text-[10px] text-slate-400">
                {user.withdraw_blocked ? 'Вывод заблокирован' : 'Вывод разрешен'}
                {!canEditStatus && ' (Нужен Суперадмин)'}
              </span>
            </div>
            <button
              disabled={!canEditStatus}
              onClick={onToggleWithdrawBlocked}
              title={!canEditStatus ? 'Только суперадмин может менять статус администраторов' : ''}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !canEditStatus
                  ? 'cursor-not-allowed bg-slate-800'
                  : user.withdraw_blocked
                    ? 'bg-rose-500 cursor-pointer'
                    : 'bg-slate-700 cursor-pointer'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  user.withdraw_blocked ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Staff / Admin Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!isSuperuserLogged ? 'opacity-50' : ''}`}>
            <div>
              <span className="font-bold text-slate-200 text-xs block">Админ</span>
              <span className="text-[10px] text-slate-400">
                {user.is_staff ? 'Доступ к админке' : 'Обычный юзер'}
                {!isSuperuserLogged && ' (Нужен Суперадмин)'}
              </span>
            </div>
            <button
              disabled={!isSuperuserLogged}
              onClick={onToggleStaff}
              title={!isSuperuserLogged ? 'Только суперадмин может менять роль админа' : ''}
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

          {/* Superuser / Superadmin Toggle */}
          <div className={`flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 ${!isSuperuserLogged ? 'opacity-50' : ''}`}>
            <div>
              <span className="font-bold text-slate-200 text-xs block">Суперадмин</span>
              <span className="text-[10px] text-slate-400">
                {user.is_superuser ? 'Полные права' : 'Ограничен'}
                {!isSuperuserLogged && ' (Нужен Суперадмин)'}
              </span>
            </div>
            <button
              disabled={!isSuperuserLogged}
              onClick={onToggleSuperuser}
              title={!isSuperuserLogged ? 'Только суперадмин может менять роль суперадмина' : ''}
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
