import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Archive, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { ArchivePredictionsToolbar } from './ArchivePredictionsToolbar';
import { PredictionCard } from '../../../components/predictions/PredictionCard';
import { predictionsSelectors } from '../../../store/slices/predictionsSlice';
import { useGetPredictionsQuery } from '../../../services/adminApi';

export const ArchivePredictionsPage: React.FC = () => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'volume'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Debounce search input (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.trim());
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch archive predictions from backend
  const { data: apiArchiveList, isLoading } = useGetPredictionsQuery({
    phase: 'archive',
    search: debouncedSearchQuery,
  });

  const allPredictions = useAppSelector(predictionsSelectors.selectAll);

  // Use API returned data or fallback to entity adapter store
  const sourcePredictions = apiArchiveList || allPredictions.filter(
    (p) => p.state === 'ENDED' || p.state === 'CANCEL'
  );

  const filteredArchive = sourcePredictions
    .filter((p) => {
      if (!debouncedSearchQuery) return true;
      const q = debouncedSearchQuery.toLowerCase();
      return p.id.toString() === q || p.title.toLowerCase().includes(q);
    })
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

      {isLoading && filteredArchive.length === 0 ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
          <span>Загрузка архивных предсказаний...</span>
        </div>
      ) : filteredArchive.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-3">
          <Archive className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-200">
            {debouncedSearchQuery ? 'Ничего не найдено' : 'В архиве пока нет предсказаний'}
          </h3>
          <p className="text-sm text-slate-400 max-w-md">
            {debouncedSearchQuery
              ? `По запросу «${debouncedSearchQuery}» предсказаний не найдено.`
              : 'Завершенные и отмененные события будут сохраняться здесь.'}
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
