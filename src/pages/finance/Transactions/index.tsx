import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setTransactions, transactionsSelectors } from '../../../store/slices/financeSlice';
import { useGetAdminTxsQuery } from '../../../services/adminApi';
import { TransactionsFilter } from './TransactionsFilter';
import { TransactionsTable } from './TransactionsTable';

export const TransactionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: apiTxs } = useGetAdminTxsQuery({ search: debouncedSearchQuery });

  useEffect(() => {
    if (apiTxs && Array.isArray(apiTxs)) {
      dispatch(setTransactions(apiTxs));
    }
  }, [apiTxs, dispatch]);

  const transactions = useAppSelector(transactionsSelectors.selectAll);

  const filteredTx = transactions.filter((tx) => {
    return filterDirection === 'ALL' || tx.direction === filterDirection;
  });

  return (
    <div className="space-y-6">
      <TransactionsFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterDirection={filterDirection}
        onDirectionChange={setFilterDirection}
      />
      <TransactionsTable filteredTx={filteredTx} />
    </div>
  );
};
