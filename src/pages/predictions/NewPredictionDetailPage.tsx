import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  RefreshCw,
  XCircle,
  BadgeCheck,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  ExternalLink,
  AlertTriangle,
  Image as ImageIcon,
  Tag,
  DollarSign,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import { sendWsMessage } from '../../services/websocket';
import {
  approveRequest,
  rejectRequest,
  regenerateIcon,
  regenerateChoiceIcon,
  regenerateAllChoiceIcons,
} from '../../store/slices/predictionsSlice';
import {
  useGetPredictionRequestByIdQuery,
  useApprovePredictionRequestMutation,
  useRejectPredictionRequestMutation,
  useChangeRequestIconMutation,
} from '../../services/adminApi';
import { REJECTION_TEMPLATES } from '../../data/mockData';
import { formatDisplayDate } from '../../utils/dates';
import { formatIconUrl } from '../../utils/images';

const DEFAULT_CHOICE_ICON = 'http://localhost/static/tmp/no_icon.png';

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
    { skip: !requestId }
  );

  const req = reduxReq || apiReq;

  const [approveApi] = useApprovePredictionRequestMutation();
  const [rejectApi] = useRejectPredictionRequestMutation();
  const [changeIconApi] = useChangeRequestIconMutation();

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customReason, setCustomReason] = useState<string>('');
  const [isRejecting, setIsRejecting] = useState<boolean>(false);

  React.useEffect(() => {
    if (requestId) {
      sendWsMessage({ type: 'request.join', value: requestId });
    }
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
      console.warn('API change-icon error, applying local icon fallback', e);
    }
    dispatch(regenerateIcon(req.id));
  };

  return (
    <div className="flex flex-col gap-6 font-sans">
      {/* Sticky Action Navigation Bar */}
      <div className="sticky top-16 z-20 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md px-9 py-3 flex flex-wrap items-center justify-between gap-4 -mx-8 -mt-8 mb-4 shadow-xl">
        <div className="flex items-center gap-3">
          <Link
            to="/predictions/new"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs font-semibold"
          >
            <ArrowLeft size={16} />
            <span>Назад к списку</span>
          </Link>

          {req.moderators && req.moderators.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0">
              <UserCheck size={14} className="text-amber-400" />
              <span>Взято в работу: @{req.moderators.join(', @')}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {!isRejecting ? (
            <>
              <button
                onClick={() => setIsRejecting(true)}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <XCircle size={16} />
                <span>Отклонить заявку</span>
              </button>

              <button
                onClick={handleApprove}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
              >
                <BadgeCheck size={18} />
                <span>Подтвердить и опубликовать</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsRejecting(false)}
              className="px-4 py-2 border border-slate-800/50 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer hover:bg-slate-700 transition-colors"
            >
              Отменить отклонение
            </button>
          )}
        </div>
      </div>

      {/* Rejection Form Drawer (If rejecting) */}
      {isRejecting && (
        <div className="bg-rose-500/10 border border-rose-500/30 p-5 rounded-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95">
          <div className="flex items-center gap-2 text-rose-300 font-bold text-sm uppercase tracking-wider">
            <AlertTriangle size={18} />
            <span>Причина отклонения заявки #{req.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                Выберите готовый шаблон причины:
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) setCustomReason(e.target.value);
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="">-- Выбрать шаблон причины --</option>
                {REJECTION_TEMPLATES.map((tmpl, idx) => (
                  <option key={idx} value={tmpl}>
                    {tmpl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">
                Или введите свой комментарий для пользователя:
              </label>
              <textarea
                rows={2}
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                placeholder="Подробное объяснение причины..."
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-rose-500/20">
            <button
              onClick={() => setIsRejecting(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              Подтвердить отклонение
            </button>
          </div>
        </div>
      )}

      {/* Main Info Card Header */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-start gap-5">
          {/* Main Prediction Icon with Regenerate Button on Image */}
          <div className="relative group shrink-0">
            <img
              src={formatIconUrl(req.icon)}
              alt="Main Icon"
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover border border-cyan-500/40 shadow-xl"
            />
            <button
              onClick={handleChangeIcon}
              className="absolute -bottom-2 -right-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-2 rounded-full shadow-lg transition-transform hover:scale-110 cursor-pointer"
              title="Сгенерировать другую главную иконку"
            >
              <RefreshCw size={14} className="font-bold" />
            </button>
          </div>

          {/* Title & Tags */}
          <div className="flex-1 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {req.groups.map((g, i) => (
                <span
                  key={i}
                  className="bg-slate-800 text-cyan-400 font-mono text-xs px-3 py-1 rounded-lg font-semibold border border-slate-700/60 flex items-center gap-1"
                >
                  <Tag size={12} />
                  {g}
                </span>
              ))}
            </div>

            <h1 className="text-xl md:text-2xl font-extrabold text-white leading-tight">
              {req.title}
            </h1>
          </div>
        </div>

        {/* 1 Single Horizontal Row with 3 Cards: Автор заявки, Ставка автора, Даты (одна под другой) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-xs">
          {/* 1. Автор заявки */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <User size={14} className="text-cyan-400" />
              <span>Автор заявки</span>
            </span>
            <div>
              <div className="text-slate-100 font-bold font-mono text-base">
                @{req.user.username}
              </div>
              <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                ID: #{req.user.id}
              </div>
            </div>
          </div>

          {/* 2. Ставка автора */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between gap-3">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <DollarSign size={14} className="text-emerald-400" />
              <span>Ставка автора</span>
            </span>
            <div>
              <div className="text-emerald-400 font-extrabold font-mono text-base">
                ${req.amount.toLocaleString()} USDT
              </div>
              {/* Plain text directly, no border, no background fill, no label */}
              <div className="text-amber-400 font-bold font-mono text-xs mt-1 truncate">
                {req.vote}
              </div>
            </div>
          </div>

          {/* 3. Даты (одна под другой, без лишнего заголовка сверху) */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-center gap-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Clock size={13} className="text-slate-500" />
                <span>Создано:</span>
              </span>
              <span className="font-mono text-slate-200 font-bold">{formatDisplayDate(req.created)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-400" />
                <span>Ставки до:</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{formatDisplayDate(req.bet_date || req.betDate)}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-cyan-400" />
                <span>Финал:</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{formatDisplayDate(req.end_date || req.endDate)}</span>
            </div>
          </div>
        </div>

        {/* Rules & Source Criteria */}
        <div className="bg-slate-950/70 p-5 rounded-2xl border border-slate-800 text-xs flex flex-col gap-3">
          <div className="font-bold text-slate-200 flex items-center gap-2">
            <FileText size={16} className="text-cyan-400" />
            <span>Правила и критерии подведения итогов</span>
          </div>
          <p className="text-slate-300 bg-slate-900/90 p-4 rounded-xl border border-slate-800 leading-relaxed text-sm">
            {req.rules}
          </p>
          {req.link && (
            <div className="pt-1">
              <a
                href={req.link}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 px-3.5 py-1.5 rounded-xl font-medium hover:bg-cyan-500/20 transition-colors cursor-pointer"
              >
                <span>Источник для проверки результатов: {req.link}</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Choices Group Section - 2 Columns Layout + Choice Icon Refresh Buttons on Images */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl glass-panel flex flex-col gap-5">
        {/* Choices Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-cyan-400" />
              <span>Варианты ответов ({req.choices.length})</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Нажмите иконку обновления на любом варианте или сгенерируйте новые картинки для всех исходов сразу.
            </p>
          </div>

          <button
            onClick={() => dispatch(regenerateAllChoiceIcons(req.id))}
            className="flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            <Sparkles size={15} />
            <span>Сгенерировать иконки для всех вариантов</span>
          </button>
        </div>

        {/* 2-Column Choices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {req.choices.map((choiceTitle, idx) => {
            const currentChoiceIcon = req.choiceIcons?.[idx] || DEFAULT_CHOICE_ICON;
            const isAuthorVote = choiceTitle === req.vote;

            return (
              <div
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors group"
              >
                {/* Choice Icon with Round Refresh Button & Title */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="relative group/choice shrink-0">
                    <img
                      src={currentChoiceIcon}
                      alt={choiceTitle}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-700 shadow-md group-hover:border-cyan-500/40 transition-colors"
                    />
                    <button
                      onClick={() =>
                        dispatch(regenerateChoiceIcon({ requestId: req.id, choiceIndex: idx }))
                      }
                      className="absolute -bottom-1.5 -right-1.5 bg-slate-900 hover:bg-cyan-500 text-slate-300 hover:text-slate-950 p-1.5 rounded-full shadow-lg border border-slate-700 transition-transform hover:scale-110 cursor-pointer"
                      title="Сгенерировать другую картинку для этого варианта"
                    >
                      <RefreshCw size={12} className="font-bold" />
                    </button>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{choiceTitle}</span>
                      {isAuthorVote && (
                        <span className="text-amber-400 font-mono text-[10px] font-bold shrink-0">
                          (Выбор автора)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 font-mono">Исход #{idx + 1}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
