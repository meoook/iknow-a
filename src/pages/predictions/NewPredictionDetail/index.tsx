import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import { useAppSelector } from '../../../store';
import { wsManager } from '../../../services/websocket';
import {
  useGetRequestByIdQuery,
  useApprovePredictionRequestMutation,
  useRejectPredictionRequestMutation,
  useChangeRequestIconMutation,
} from '../../../services/adminApi';
import { PredictionDetailStickyHeader } from './PredictionDetailStickyHeader';
import { PredictionDetailMainCard } from './PredictionDetailMainCard';
import { PredictionDetailChoicesList } from './PredictionDetailChoicesList';

import { requestsSelectors } from '../../../store/slices/predictionsSlice';

export const NewPredictionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const requestId = Number(id);
  const req = useAppSelector((state) => requestsSelectors.selectById(state, requestId));

  const { isLoading: isApiLoading } = useGetRequestByIdQuery(requestId, { skip: !requestId || Boolean(req) });

  const [approveApi] = useApprovePredictionRequestMutation();
  const [rejectApi] = useRejectPredictionRequestMutation();
  const [changeIconApi] = useChangeRequestIconMutation();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);
  const [isGeneratingIcon, setIsGeneratingIcon] = useState<boolean>(false);
  const prevIconRef = React.useRef(req?.icon);

  useEffect(() => {
    if (req?.icon && req.icon !== prevIconRef.current) {
      prevIconRef.current = req.icon;
      setIsGeneratingIcon(false);
    }
  }, [req?.icon]);

  useEffect(() => {
    if (requestId) wsManager.requestJoin(requestId);
    return () => {
      if (requestId) wsManager.requestLeave(requestId);
    };
  }, [requestId]);

  if (isApiLoading && !req) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">Загрузка информации о заявке...</p>
      </div>
    );
  }

  if (!req) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center gap-4">
        <XCircle className="w-12 h-12 text-slate-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-200">Заявка не найдена или уже была обработана</h2>
        <p className="text-sm text-slate-400">
          Заявка с ID #{id} была одобрена, отклонена или не существует.
        </p>
        <Link
          to="/predictions/new"
          className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-cyan-500/20 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Вернуться к списку новых предсказаний</span>
        </Link>
      </div>
    );
  }

  const handleApprove = () => {
    const targetId = req.id;
    approveApi(targetId)
      .unwrap()
      .then(() => {
        navigate('/predictions/new');
      })
      .catch((e) => {
        console.warn('API approve call error', e);
      });
  };

  const handleConfirmReject = () => {
    const targetId = req.id;
    const finalReason = customReason.trim() || selectedTemplate || 'Отклонено модератором';
    rejectApi({ id: targetId, reason: finalReason })
      .unwrap()
      .then(() => {
        navigate('/predictions/new');
      })
      .catch((e) => {
        console.warn('API reject call error', e);
      });
  };

  const handleChangeIcon = async () => {
    if (isGeneratingIcon || !req) return;
    setIsGeneratingIcon(true);
    try {
      await changeIconApi(req.id).unwrap();
    } catch (e) {
      console.warn('API change-icon error', e);
      setIsGeneratingIcon(false);
    }
  };

  const handleSelectTemplate = (val: string) => {
    setSelectedTemplate(val);
    if (val) setCustomReason(val);
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      <PredictionDetailStickyHeader
        req={req}
        isRejecting={isRejecting}
        selectedTemplate={selectedTemplate}
        customReason={customReason}
        onSetIsRejecting={setIsRejecting}
        onSelectTemplate={handleSelectTemplate}
        onCustomReasonChange={setCustomReason}
        onApprove={handleApprove}
        onConfirmReject={handleConfirmReject}
      />
      <PredictionDetailMainCard
        req={req}
        isGeneratingIcon={isGeneratingIcon}
        onChangeIcon={handleChangeIcon}
      />
      <PredictionDetailChoicesList
        req={req}
        isGeneratingIcon={isGeneratingIcon}
        onRegenerateChoiceIcon={() => handleChangeIcon()}
        onRegenerateAllChoiceIcons={() => handleChangeIcon()}
      />
    </div>
  );

};
