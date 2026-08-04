import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { resolveActivePrediction } from '../../../store/slices/predictionsSlice';
import { IPredictionItem } from '../../../types';
import { ActivePredictionsToolbar } from './ActivePredictionsToolbar';
import { ActivePredictionsTable } from './ActivePredictionsTable';
import { PredictionResolutionModal } from './PredictionResolutionModal';

export const ActivePredictionsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const activePredictions = useAppSelector((state) => state.predictions.active);

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'volume'>('volume');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedPrediction, setSelectedPrediction] = useState<IPredictionItem | null>(null);
  const [selectedWinningChoice, setSelectedWinningChoice] = useState<number | null>(null);

  const filteredPredictions = activePredictions
    .filter((p) => p.title.toLowerCase().includes(searchQuery.toLowerCase().trim()))
    .sort((a, b) => {
      if (sortBy === 'volume') {
        return sortOrder === 'desc' ? b.volume - a.volume : a.volume - b.volume;
      } else {
        const dateA = new Date(a.created).getTime();
        const dateB = new Date(b.created).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });

  const handleOpenModal = (pred: IPredictionItem) => {
    setSelectedPrediction(pred);
    setSelectedWinningChoice(pred.choices[0]?.id || null);
  };

  const handleCloseModal = () => {
    setSelectedPrediction(null);
    setSelectedWinningChoice(null);
  };

  const handleConfirmResolve = () => {
    if (selectedPrediction && selectedWinningChoice !== null) {
      dispatch(
        resolveActivePrediction({
          predictionId: selectedPrediction.id,
          winningChoiceId: selectedWinningChoice,
        })
      );
      handleCloseModal();
    }
  };

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
      <ActivePredictionsToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSortByVolume={handleSortByVolume}
        onSortByDate={handleSortByDate}
      />
      <ActivePredictionsTable
        filteredPredictions={filteredPredictions}
        onOpenModal={handleOpenModal}
      />
      <PredictionResolutionModal
        selectedPrediction={selectedPrediction}
        selectedWinningChoice={selectedWinningChoice}
        onSelectChoice={setSelectedWinningChoice}
        onClose={handleCloseModal}
        onConfirmResolve={handleConfirmResolve}
      />
    </div>
  );
};
