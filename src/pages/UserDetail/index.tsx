import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, KeyRound, XCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  toggleUserActive,
  toggleUserWithdrawBlocked,
  toggleUserStaff,
  toggleUserSuperuser,
  changeUserPassword,
} from '../../store/slices/usersSlice';
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
  const dispatch = useAppDispatch();
  const userId = Number(id);

  const { data: loggedAdminUser } = useGetAdminUserQuery();

  const cachedUserFromList = useAppSelector((state) => {
    const queries = (state as any).adminApi?.queries || {};
    for (const key in queries) {
      if (key.startsWith('getAdminUsersList(') && queries[key]?.data) {
        const data = queries[key].data;
        const items = Array.isArray(data) ? data : data?.results;
        const found = items?.find((u: any) => u.id === userId);
        if (found) return found;
      }
    }
    return undefined;
  });

  const { data: apiDetailUser, isLoading: isDetailLoading } = useGetAdminUserByIdQuery(userId, {
    skip: !userId || Boolean(cachedUserFromList),
  });
  const { data: apiIps, isLoading: isIpsLoading } = useGetAdminUserIpsQuery(userId, { skip: !userId });
  const { data: apiComments, isLoading: isCommentsLoading } = useGetAdminUserCommentsQuery(userId, { skip: !userId });
  const { data: apiBets, isLoading: isBetsLoading } = useGetAdminUserBetsQuery(userId, { skip: !userId });
  const { data: apiWallets, isLoading: isWalletsLoading } = useGetAdminUserWalletsQuery(userId, { skip: !userId });
  const [updateAdminUser] = useUpdateAdminUserMutation();
  const isSuperuserLogged = loggedAdminUser?.is_superuser === true;

  const reduxUser = useAppSelector((state) =>
    state.users.users.find((u) => u.id === userId)
  );

  const effectiveUser = cachedUserFromList || apiDetailUser;

  const user: IUserItem | undefined = effectiveUser
    ? {
        id: effectiveUser.id,
        username: effectiveUser.username,
        email: effectiveUser.email || reduxUser?.email,
        address: effectiveUser.address || reduxUser?.address,
        balance: effectiveUser.balance !== undefined ? effectiveUser.balance : (reduxUser?.balance || 0),
        is_active: effectiveUser.is_active !== undefined ? effectiveUser.is_active : (reduxUser?.is_active ?? true),
        withdraw_blocked: effectiveUser.withdraw_blocked !== undefined ? effectiveUser.withdraw_blocked : (reduxUser?.withdraw_blocked ?? false),
        is_staff: effectiveUser.is_staff !== undefined ? effectiveUser.is_staff : (reduxUser?.is_staff ?? false),
        is_superuser: effectiveUser.is_superuser !== undefined ? effectiveUser.is_superuser : (reduxUser?.is_superuser ?? false),
        created: effectiveUser.created !== undefined ? effectiveUser.created : (reduxUser?.created || 0),
        telegram_id: effectiveUser.telegram_id || reduxUser?.telegram_id,
      }
    : reduxUser
      ? {
          id: reduxUser.id,
          username: reduxUser.username,
          email: reduxUser.email,
          address: reduxUser.address,
          balance: reduxUser.balance || 0,
          is_active: reduxUser.is_active ?? true,
          withdraw_blocked: reduxUser.withdraw_blocked ?? false,
          is_staff: reduxUser.is_staff ?? false,
          is_superuser: reduxUser.is_superuser ?? false,
          created: reduxUser.created || 0,
          telegram_id: reduxUser.telegram_id,
        }
      : undefined;

  const ipLogs = apiIps && apiIps.length > 0
    ? apiIps
    : ((reduxUser as any)?.recentIps || []).map((item: any, idx: number) => ({
        id: idx + 1,
        ip: item.ip,
        last_used: item.timestamp,
      }));

  const commentsList = apiComments && apiComments.length > 0
    ? apiComments
    : ((reduxUser as any)?.recentMessages || []).map((item: any, idx: number) => ({
        id: idx + 1,
        prediction: item.topic,
        text: item.message,
        created: item.timestamp,
      }));

  const betsList = apiBets && apiBets.length > 0
    ? apiBets
    : ((reduxUser as any)?.recentBets || []).map((item: any, idx: number) => ({
        id: idx + 1,
        prediction: item.predictionTitle,
        choice: item.choice,
        amount: item.amount,
        multiplier: item.multiplier,
        payout: item.payout || 0,
        state: item.status,
        created: item.timestamp,
      }));

  const walletsList = apiWallets && apiWallets.length > 0
    ? apiWallets
    : ((reduxUser as any)?.depositWallets || []).map((item: any, idx: number) => ({
        id: idx + 1,
        address: item.address,
        chain: item.chain,
      }));

  const balanceHistory: { time: string; value: number }[] = (reduxUser as any)?.balanceHistory || [];
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
    dispatch(toggleUserActive(user.id));
    updateAdminUser({ id: user.id, is_active: !user.is_active }).unwrap().catch(() => { });
  };

  const handleToggleWithdrawBlocked = () => {
    dispatch(toggleUserWithdrawBlocked(user.id));
    updateAdminUser({ id: user.id, withdraw_blocked: !user.withdraw_blocked }).unwrap().catch(() => { });
  };

  const handleToggleStaff = () => {
    if (!isSuperuserLogged) return;
    dispatch(toggleUserStaff(user.id));
    updateAdminUser({ id: user.id, is_staff: !user.is_staff }).unwrap().catch(() => { });
  };

  const handleToggleSuperuser = () => {
    if (!isSuperuserLogged) return;
    dispatch(toggleUserSuperuser(user.id));
    updateAdminUser({ id: user.id, is_superuser: !user.is_superuser }).unwrap().catch(() => { });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim()) {
      dispatch(changeUserPassword({ userId: user.id, newPassword }));
      updateAdminUser({ id: user.id, password: newPassword }).unwrap().catch(() => { });
      setPasswordSuccess(true);
      setNewPassword('');
      setTimeout(() => {
        setPasswordSuccess(false);
        setIsPasswordModalOpen(false);
      }, 1500);
    }
  };

  const chartData = balanceHistory && balanceHistory.length > 0
    ? balanceHistory
    : [
        { time: '2026-07-01', value: user.balance * 0.6 },
        { time: '2026-07-10', value: user.balance * 0.75 },
        { time: '2026-07-20', value: user.balance * 0.9 },
        { time: '2026-08-03', value: user.balance },
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
