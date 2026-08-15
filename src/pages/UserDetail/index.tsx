import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, UserCheck, XCircle, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../store';
import {
  useGetUserByIdQuery,
  useGetUserIpsQuery,
  useGetUserCommentsQuery,
  useGetUserBetsQuery,
  useGetUserWalletsQuery,
  useUpdateUserMutation,
} from '../../services/adminApi';
import { IUserItem } from '../../types';
import { UserProfileHeader } from './UserProfileHeader';
import { UserAdminActions } from './UserAdminActions';
import { UserBalanceCard } from './UserBalanceCard';
import { UserDepositWallets } from './UserDepositWallets';
import { UserActivityLogs } from './UserActivityLogs';
import { UserPasswordModal } from './UserPasswordModal';
import { UserUsernameModal } from './UserUsernameModal';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const currentUser = useAppSelector((state) => state.auth.user);

  const { data: apiDetailUser, isLoading: isDetailLoading } = useGetUserByIdQuery(userId, { skip: !userId });
  const { data: apiIps, isLoading: isIpsLoading } = useGetUserIpsQuery(userId, { skip: !userId });
  const { data: apiComments, isLoading: isCommentsLoading } = useGetUserCommentsQuery(userId, { skip: !userId });
  const { data: apiBets, isLoading: isBetsLoading } = useGetUserBetsQuery(userId, { skip: !userId });
  const { data: apiWallets, isLoading: isWalletsLoading } = useGetUserWalletsQuery(userId, { skip: !userId });
  const [updateUser] = useUpdateUserMutation();
  const isSuperuserLogged = currentUser?.is_superuser === true;

  const user: IUserItem | undefined = apiDetailUser;

  const ipLogs = apiIps || [];
  const commentsList = apiComments || [];
  const betsList = apiBets || [];
  const walletsList = apiWallets || [];

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);


  const isLoading = isDetailLoading && !user;

  if (isLoading) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mx-auto" />
        <span className="text-sm font-semibold text-slate-400">Загрузка данных пользователя...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <XCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Пользователь не найден</h2>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleToggleActive = () => {
    if (!isSuperuserLogged && (user.is_staff || user.is_superuser)) return;
    updateUser({ id: user.id, is_active: !user.is_active }).unwrap().catch(() => { });
  };

  const handleToggleWithdrawBlocked = () => {
    if (!isSuperuserLogged && (user.is_staff || user.is_superuser)) return;
    updateUser({ id: user.id, withdraw_blocked: !user.withdraw_blocked }).unwrap().catch(() => { });
  };

  const handleToggleStaff = () => {
    if (!isSuperuserLogged) return;
    updateUser({ id: user.id, is_staff: !user.is_staff }).unwrap().catch(() => { });
  };

  const handleToggleSuperuser = () => {
    if (!isSuperuserLogged) return;
    updateUser({ id: user.id, is_superuser: !user.is_superuser }).unwrap().catch(() => { });
  };

  const handleSubmitUsername = async (newUsername: string) => {
    await updateUser({ id: user.id, username: newUsername }).unwrap();
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim()) {
      updateUser({ id: user.id, password: newPassword }).unwrap().then(() => {
        setPasswordSuccess(true);
        setNewPassword('');
        setTimeout(() => {
          setPasswordSuccess(false);
          setIsPasswordModalOpen(false);
        }, 1500);
      }).catch(() => { });
    }
  };

  const chartData = [
    { time: '2026-08-01', value: user.balance * 0.9 },
    { time: '2026-08-04', value: user.balance },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
        >
          <ArrowLeft size={16} />
          <span>Назад к списку</span>
        </Link>

        <div className="flex items-center gap-2.5">
          {/* Change Username Button */}
          <button
            disabled={!isSuperuserLogged}
            onClick={() => setIsUsernameModalOpen(true)}
            title={!isSuperuserLogged ? 'Только суперпользователь может менять username' : ''}
            className={`inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${!isSuperuserLogged
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer'
              }`}
          >
            <UserCheck size={14} />
            <span>Сменить username</span>
          </button>

          {/* Change Password Button */}
          <button
            disabled={!isSuperuserLogged}
            onClick={() => setIsPasswordModalOpen(true)}
            title={!isSuperuserLogged ? 'Только суперпользователь может менять пароль' : ''}
            className={`inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all ${!isSuperuserLogged
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:border-cyan-500/50 hover:bg-slate-800 cursor-pointer'
              }`}
          >
            <KeyRound size={14} />
            <span>Сменить пароль</span>
          </button>
        </div>
      </div>

      {/* Main Profile Header & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserProfileHeader
          user={user}
          copiedText={copiedText}
          onCopy={handleCopy}
        />
        <UserAdminActions
          user={user}
          isSuperuserLogged={isSuperuserLogged}
          onToggleActive={handleToggleActive}
          onToggleWithdrawBlocked={handleToggleWithdrawBlocked}
          onToggleStaff={handleToggleStaff}
          onToggleSuperuser={handleToggleSuperuser}
        />
      </div>

      {/* Middle Block Grid: Balance Chart & Deposit Wallets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UserBalanceCard balance={user.balance} chartData={chartData} />
        <UserDepositWallets
          isLoading={isWalletsLoading}
          walletsList={walletsList}
          copiedText={copiedText}
          onCopy={handleCopy}
        />
      </div>

      {/* Activity Log Blocks Grid */}
      <UserActivityLogs
        isIpsLoading={isIpsLoading}
        ipLogs={ipLogs}
        isCommentsLoading={isCommentsLoading}
        commentsList={commentsList}
        isBetsLoading={isBetsLoading}
        betsList={betsList}
      />

      {/* Username Change Modal */}
      <UserUsernameModal
        isOpen={isUsernameModalOpen}
        currentUsername={user.username}
        userId={user.id}
        onSubmitUsername={handleSubmitUsername}
        onUpdateSuccess={() => { }}
        onClose={() => setIsUsernameModalOpen(false)}
      />

      {/* Password Change Modal */}
      <UserPasswordModal
        isOpen={isPasswordModalOpen}
        username={user.username}
        newPassword={newPassword}
        passwordSuccess={passwordSuccess}
        onPasswordChange={handleChangePassword}
        onNewPasswordChange={setNewPassword}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

