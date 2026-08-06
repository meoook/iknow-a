import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, XCircle, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store';
import { sendWsMessage, wsManager } from '../../../services/websocket';
import {
  approveRequest,
  rejectRequest,
} from '../../../store/slices/predictionsSlice';
import {
  useGetPredictionRequestByIdQuery,
  useApprovePredictionRequestMutation,
  useRejectPredictionRequestMutation,
  useChangeRequestIconMutation,
} from '../../../services/adminApi';
import { PredictionDetailStickyHeader } from './PredictionDetailStickyHeader';
import { PredictionDetailMainCard } from './PredictionDetailMainCard';
import { PredictionDetailChoicesList } from './PredictionDetailChoicesList';

export const NewPredictionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const requestId = Number(id);
  const reduxReq = useAppSelector((state) =>
    state.predictions.requests.find((r) => r.id === requestId)
  );

  const { data: apiReq, isLoading: isApiLoading } = useGetPredictionRequestByIdQuery(
    requestId,
    { skip: !requestId || Boolean(reduxReq) }
  );

  const req = reduxReq || apiReq;

  const [approveApi] = useApprovePredictionRequestMutation();
  const [rejectApi] = useRejectPredictionRequestMutation();
  const [changeIconApi] = useChangeRequestIconMutation();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  useEffect(() => {
    if (requestId) wsManager.requestJoin(requestId);
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
    dispatch(approveRequest(targetId));
    navigate('/predictions/new');
    approveApi(targetId).catch((e) => {
      console.warn('API approve call error', e);
    });
  };

  const handleConfirmReject = () => {
    const targetId = req.id;
    const finalReason = customReason.trim() || selectedTemplate || 'Отклонено модератором';
    dispatch(rejectRequest({ id: targetId, reason: finalReason }));
    navigate('/predictions/new');
    rejectApi({ id: targetId, reason: finalReason }).catch((e) => {
      console.warn('API reject call error', e);
    });
  };

  const handleChangeIcon = async () => {
    try {
      await changeIconApi(req.id).unwrap();
    } catch (e) {
      console.warn('API change-icon error', e);
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
        onChangeIcon={handleChangeIcon}
      />
      <PredictionDetailChoicesList
        req={req}
        onRegenerateChoiceIcon={() => handleChangeIcon()}
        onRegenerateAllChoiceIcons={() => handleChangeIcon()}
      />
    </div>
  );
};
