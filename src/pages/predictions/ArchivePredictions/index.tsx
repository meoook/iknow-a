import React, { useState } from 'react';
import { useAppSelector } from '../../../store';
import { ArchivePredictionsToolbar } from './ArchivePredictionsToolbar';
import { ArchivePredictionsTable } from './ArchivePredictionsTable';

export const ArchivePredictionsPage: React.FC = () => {
  const archivePredictions = useAppSelector((state) => state.predictions.archive);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'volume'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredArchive = archivePredictions
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'volume') {
        return sortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume;
      } else {
        const dateA = new Date(a.closed || a.endDate).getTime();
        const dateB = new Date(b.closed || b.endDate).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

  const handleSortByVolume = () => {
    if (sortBy === 'volume') {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy('volume');
      setSortOrder('desc');
    }
  };

  const handleSortByDate = () => {
    if (sortBy === 'date') {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy('date');
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      <ArchivePredictionsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByVolume={handleSortByVolume}
        onSortByDate={handleSortByDate}
      />
      <ArchivePredictionsTable filteredArchive={filteredArchive} />
    </div>
  );
};
