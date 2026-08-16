import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { ArchivePredictionsToolbar } from './ArchivePredictionsToolbar';
import { PredictionCard } from '../../../components/predictions/PredictionCard';
import { predictionsSelectors } from '../../../store/slices/predictionsSlice';

export const ArchivePredictionsPage: React.FC = () => {
  const navigate = useNavigate();
  const allPredictions = useAppSelector(predictionsSelectors.selectAll);
  const archivePredictions = allPredictions.filter(
    (p) => p.state === 'ENDED' || p.state === 'CANCEL'
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'volume'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredArchive = archivePredictions
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'volume') {
        return sortOrder === 'desc' ? (b.volume || 0) - (a.volume || 0) : (a.volume || 0) - (b.volume || 0);
      } else {
        const dateA = new Date(a.closed || a.end_date || a.created).getTime();
        const dateB = new Date(b.closed || b.end_date || b.created).getTime();
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

  const handleCardClick = (id: number) => {
    navigate(`/predictions/detail/${id}`);
  };

  return (
    <div className="space-y-6 font-sans">
      <ArchivePredictionsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByVolume={handleSortByVolume}
        onSortByDate={handleSortByDate}
      />

      {filteredArchive.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <Archive className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">В архиве пока нет предсказаний</h3>
          <p className="text-sm text-slate-400 max-w-md">
            Завершенные и отмененные события будут сохраняться здесь.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredArchive.map((pred) => (
            <PredictionCard key={pred.id} prediction={pred} onClick={handleCardClick} />
          ))}
        </div>
      )}
    </div>
  );
};
