import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetUsersInfoQuery, useGetUsersListQuery } from '../../services/adminApi';
import { IUserItem } from '../../types';
import { UsersSummaryCards } from './UsersSummaryCards';
import { UsersSearchToolbar } from './UsersSearchToolbar';
import { UsersTable } from './UsersTable';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'user' | 'admin'>('user');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRoleFilterChange = (role: 'user' | 'admin') => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const { data: infoData } = useGetUsersInfoQuery();
  const { data: apiUsersList } = useGetUsersListQuery({
    search: debouncedSearchQuery,
    is_staff: roleFilter === 'admin' ? 1 : 0,
  });

  const totalUsers = infoData?.total_users ?? 0;
  const newUsersCount = infoData?.new_users ?? 0;
  const totalBalance = infoData?.total_balance ?? 0;

  const displayUsers: IUserItem[] = (apiUsersList || []).map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email || '',
    address: u.address || '',
    balance: u.balance !== undefined ? u.balance : (u.balanceUsd || 0),
    is_active: u.is_active !== undefined ? u.is_active : (u.isActive ?? true),
    withdraw_blocked: u.withdraw_blocked !== undefined ? u.withdraw_blocked : (u.withdrawBlocked ?? false),
    is_staff: u.is_staff !== undefined ? u.is_staff : (u.isStaff ?? false),
    is_superuser: u.is_superuser !== undefined ? u.is_superuser : (u.isSuperuser ?? false),
    created: u.created !== undefined ? u.created : (u.createdAt || 0),
    telegram_id: u.telegram_id || u.telegramId,
    avatar: u.avatar || u.avatarUrl,
  }));

  const totalPages = Math.ceil(displayUsers.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentUsers = displayUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (userId: number) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div className="space-y-6 font-sans">
      <UsersSummaryCards
        totalUsers={totalUsers}
        newUsersCount={newUsersCount}
        totalBalance={totalBalance}
      />
      <UsersSearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        roleFilter={roleFilter}
        onRoleFilterChange={handleRoleFilterChange}
      />

      <UsersTable
        currentUsers={currentUsers}
        displayUsersCount={displayUsers.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalPages={totalPages}
        startIndex={startIndex}
        onRowClick={handleRowClick}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
