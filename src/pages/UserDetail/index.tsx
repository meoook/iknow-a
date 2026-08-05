import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, XCircle, Loader2 } from 'lucide-react';
import {
  useGetAdminUserQuery,
  useGetAdminUserByIdQuery,
  useGetAdminUserIpsQuery,
  useGetAdminUserCommentsQuery,
  useGetAdminUserBetsQuery,
  useGetAdminUserWalletsQuery,
  useUpdateAdminUserMutation,
} from '../../services/adminApi';
import { IUserItem } from '../../types';
import { UserProfileHeader } from './UserProfileHeader';
import { UserAdminActions } from './UserAdminActions';
import { UserBalanceCard } from './UserBalanceCard';
import { UserDepositWallets } from './UserDepositWallets';
import { UserActivityLogs } from './UserActivityLogs';
import { UserPasswordModal } from './UserPasswordModal';

export const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);

  const { data: loggedAdminUser } = useGetAdminUserQuery();

  const { data: apiDetailUser, isLoading: isDetailLoading } = useGetAdminUserByIdQuery(userId, {
    skip: !userId,
  });
  const { data: apiIps, isLoading: isIpsLoading } = useGetAdminUserIpsQuery(userId, { skip: !userId });
  const { data: apiComments, isLoading: isCommentsLoading } = useGetAdminUserCommentsQuery(userId, { skip: !userId });
  const { data: apiBets, isLoading: isBetsLoading } = useGetAdminUserBetsQuery(userId, { skip: !userId });
  const { data: apiWallets, isLoading: isWalletsLoading } = useGetAdminUserWalletsQuery(userId, { skip: !userId });
  const [updateAdminUser] = useUpdateAdminUserMutation();
  const isSuperuserLogged = loggedAdminUser?.is_superuser === true;

  const effectiveUser = apiDetailUser;

  const user: IUserItem | undefined = apiDetailUser;

  const ipLogs = apiIps || [];
  const commentsList = apiComments || [];
  const betsList = apiBets || [];
  const walletsList = apiWallets || [];

  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
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
    updateAdminUser({ id: user.id, is_active: !user.is_active }).unwrap().catch(() => { });
  };

  const handleToggleWithdrawBlocked = () => {
    updateAdminUser({ id: user.id, withdraw_blocked: !user.withdraw_blocked }).unwrap().catch(() => { });
  };

  const handleToggleStaff = () => {
    if (!isSuperuserLogged) return;
    updateAdminUser({ id: user.id, is_staff: !user.is_staff }).unwrap().catch(() => { });
  };

  const handleToggleSuperuser = () => {
    if (!isSuperuserLogged) return;
    updateAdminUser({ id: user.id, is_superuser: !user.is_superuser }).unwrap().catch(() => { });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim()) {
      updateAdminUser({ id: user.id, password: newPassword }).unwrap().then(() => {
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

        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-all cursor-pointer shadow-md"
        >
          <KeyRound size={14} />
          <span>Сменить пароль</span>
        </button>
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
