import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { UserDetailPage } from './pages/UserDetail';
import { NewPredictionsPage } from './pages/predictions/NewPredictions';
import { NewPredictionDetailPage } from './pages/predictions/NewPredictionDetail';
import { WinnerSelectionPage } from './pages/predictions/WinnerSelection';
import { FinishPredictionsPage } from './pages/predictions/FinishPredictions';
import { PredictionDetailPage } from './pages/predictions/PredictionDetail';
import { ArchivePredictionsPage } from './pages/predictions/ArchivePredictions';
import { FinanceInfoPage } from './pages/finance/FinanceInfo';
import { TransactionsPage } from './pages/finance/Transactions';
import { WithdrawalsPage } from './pages/finance/Withdrawals';
import { useAppSelector } from './store';
import { Loader2 } from 'lucide-react';

const ProtectedLayout: React.FC = () => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/users/:id" element={<UserDetailPage />} />

            {/* Predictions Group */}
            <Route path="/predictions/new" element={<NewPredictionsPage />} />
            <Route path="/predictions/new/:id" element={<NewPredictionDetailPage />} />
            <Route path="/predictions/dispute" element={<WinnerSelectionPage />} />
            <Route path="/predictions/finish" element={<FinishPredictionsPage />} />
            <Route path="/predictions/detail/:id" element={<PredictionDetailPage />} />
            <Route path="/predictions/archive" element={<ArchivePredictionsPage />} />

            {/* Finances Group */}
            <Route path="/finances/info" element={<FinanceInfoPage />} />
            <Route path="/finances/transactions" element={<TransactionsPage />} />
            <Route path="/finances/withdrawals" element={<WithdrawalsPage />} />

            {/* Fallback to Dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  const isAuthChecking = useAppSelector((state) => state.auth.isAuthChecking);

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3 bg-slate-900/80 px-6 py-4 rounded-2xl border border-slate-800 shadow-2xl">
          <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
          <span className="text-sm font-semibold text-slate-200">Проверка сессии...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
};
