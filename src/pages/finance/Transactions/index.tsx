import React, { useState } from 'react';
import { useAppSelector } from '../../../store';
import { TransactionsFilter } from './TransactionsFilter';
import { TransactionsTable } from './TransactionsTable';

export const TransactionsPage: React.FC = () => {
  const transactions = useAppSelector((state) => state.finance.transactions);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterDirection, setFilterDirection] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  const filteredTx = transactions.filter((tx) => {
    const matchesSearch =
      tx.user.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      tx.chain.toLowerCase().includes(searchQuery.toLowerCase().trim());

    const matchesDirection =
      filterDirection === 'ALL' || tx.direction === filterDirection;

    return matchesSearch && matchesDirection;
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
