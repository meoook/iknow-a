import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie, removeCookie } from '../utils/cookies';
import { setAuthFailed } from '../store/slices/authSlice';
import {
  IAdminUser,
  IAdminUsersInfo,
  IPredictionRequestItem,
  IPredictionItem,
  IUserItem,
  IAdminUserUpdatePayload,
  IAdminUserIpLog,
  IAdminUserComment,
  IAdminUserBet,
  IAdminUserDepositWallet,
  IExternalTxItem,
} from '../types';
import {
  setPredictionRequests,
  upsertPredictionRequest,
  removePredictionRequest,
  setPredictions,
  upsertPrediction,
  removePrediction,
} from '../store/slices/predictionsSlice';
import {
  setTransactions,
  upsertTransaction,
  setWithdrawals,
  upsertWithdrawal,
  updateWithdrawal,
} from '../store/slices/financeSlice';


const rawBaseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  credentials: 'include',
  timeout: 20000,
  prepareHeaders: (headers) => {
    const csrf = getCookie('csrftoken');
    if (csrf) headers.set('X-CSRFToken', csrf);
    return headers;
  },
});

const baseQueryWithReauth: typeof rawBaseQuery = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    api.dispatch(setAuthFailed());
    // removeCookie('authed');
  }
  return result;
};

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['UsersList', 'Withdraw'],
  endpoints: (builder) => ({
    getAuthUser: builder.query<IAdminUser, void>({
      query: () => 'auth/user',
    }),
    adminLogin: builder.mutation<{ ok: boolean }, { username: string; password: string }>({
      query: (body) => ({
        url: 'auth/login',
        method: 'POST',
        body,
      }),
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user',
        method: 'DELETE',
      }),
    }),

    getRequests: builder.query<IPredictionRequestItem[], void>({
      query: () => 'admin/requests',
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && Array.isArray(data)) dispatch(setPredictionRequests(data));
        } catch { }
      },
    }),
    getRequestById: builder.query<IPredictionRequestItem, number>({
      query: (id) => `admin/requests/${id}`,
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) dispatch(upsertPredictionRequest(data));
        } catch { }
      },
    }),
    approvePredictionRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/requests/${id}/approve`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(removePredictionRequest(id));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
    rejectPredictionRequest: builder.mutation<void, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `admin/requests/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        dispatch(removePredictionRequest(id));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
    changeRequestIcon: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/requests/${id}/icon`,
        method: 'POST',
        body: { icon: true },
      }),
    }),

    getPredictions: builder.query<IPredictionItem[], { phase?: string } | void>({
      query: (params) => {
        if (params && typeof params === 'object' && params.phase) {
          return `admin/predictions?phase=${encodeURIComponent(params.phase)}`;
        }
        return 'admin/predictions';
      },
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && Array.isArray(data)) dispatch(setPredictions(data));
        } catch { }
      },
    }),
    getPredictionById: builder.query<IPredictionItem, number>({
      query: (id) => `admin/predictions/${id}`,
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) dispatch(upsertPrediction(data));
        } catch { }
      },
    }),
    setPredictionWinner: builder.mutation<void, { predictionId: number; choiceId: number }>({
      query: ({ predictionId, choiceId }) => ({
        url: `admin/predictions/${predictionId}/winner`,
        method: 'POST',
        body: { choice_id: choiceId },
      }),
      async onQueryStarted({ predictionId }, { dispatch, queryFulfilled }) {
        dispatch(removePrediction(predictionId));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
    finishPrediction: builder.mutation<void, number>({
      query: (predictionId) => ({
        url: `admin/predictions/${predictionId}/close`,
        method: 'POST',
      }),
      async onQueryStarted(predictionId, { dispatch, queryFulfilled }) {
        dispatch(removePrediction(predictionId));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
    extendPredictionDispute: builder.mutation<void, { predictionId: number; days?: number }>({
      query: ({ predictionId, days = 1 }) => ({
        url: `admin/predictions/${predictionId}/extend`,
        method: 'POST',
        body: { days },
      }),
      async onQueryStarted({ predictionId }, { dispatch, queryFulfilled }) {
        dispatch(removePrediction(predictionId));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
    getUsersInfo: builder.query<IAdminUsersInfo, void>({
      query: () => 'admin/users/info',
    }),
    getUsersList: builder.query<IUserItem[], { search?: string }>({
      query: ({ search }) => `admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`,
      providesTags: ['UsersList'],
    }),
    getUserById: builder.query<IUserItem, number>({
      query: (id) => `admin/users/${id}`,
    }),
    getUserIps: builder.query<IAdminUserIpLog[], number>({
      query: (id) => `admin/users/${id}/ips`,
    }),
    getUserComments: builder.query<IAdminUserComment[], number>({
      query: (id) => `admin/users/${id}/comments`,
    }),
    getUserBets: builder.query<IAdminUserBet[], number>({
      query: (id) => `admin/users/${id}/bets`,
    }),
    getUserWallets: builder.query<IAdminUserDepositWallet[], number>({
      query: (id) => `admin/users/${id}/wallets`,
    }),
    updateUser: builder.mutation<IUserItem, IAdminUserUpdatePayload>({
      query: ({ id, ...body }) => ({
        url: `admin/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => {
        const hasStatusChange =
          arg.is_active !== undefined ||
          arg.withdraw_blocked !== undefined ||
          arg.is_staff !== undefined ||
          arg.is_superuser !== undefined;

        return hasStatusChange ? ['UsersList'] : [];
      },
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        // Optimistically update single user detail cache
        const patchResultDetail = dispatch(
          adminApi.util.updateQueryData('getUserById', id, (draft) => {
            if (draft) Object.assign(draft, patch);
          })
        );

        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(
              adminApi.util.updateQueryData('getUserById', id, (draft) => {
                if (draft) Object.assign(draft, data);
              })
            );
          }
        } catch {
          patchResultDetail.undo();
        }
      },
    }),

    getAdminTxs: builder.query<IExternalTxItem[], { withdraw?: boolean | number; search?: string } | void>({
      query: (params) => {
        const queryParts: string[] = [];
        if (params && typeof params === 'object') {
          if (params.withdraw) queryParts.push('withdraw=1');
          if (params.search && params.search.trim()) {
            queryParts.push(`search=${encodeURIComponent(params.search.trim())}`);
          }
        }
        return queryParts.length ? `admin/tx?${queryParts.join('&')}` : 'admin/tx';
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && Array.isArray(data)) {
            if (arg && typeof arg === 'object' && arg.withdraw) {
              dispatch(setWithdrawals(data));
            } else {
              dispatch(setTransactions(data));
            }
          }
        } catch { }
      },
    }),

    getAdminTxById: builder.query<IExternalTxItem, number>({
      query: (id) => `admin/tx/${id}`,
      async onQueryStarted(_id, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data) {
            dispatch(upsertTransaction(data));
            if (data.direction === 'OUT') dispatch(upsertWithdrawal(data));
          }
        } catch { }
      },
    }),
    approveWithdrawal: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/tx/${id}/approve`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(updateWithdrawal({ id, changes: { status: 'APPROVED' } }));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
    rejectWithdrawal: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/tx/${id}/reject`,
        method: 'POST',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        dispatch(updateWithdrawal({ id, changes: { status: 'REJECTED' } }));
        try {
          await queryFulfilled;
        } catch { }
      },
    }),
  }),
});

export const {
  useAdminLoginMutation,
  useSignOutMutation,
  useGetRequestsQuery,
  useGetRequestByIdQuery,
  useApprovePredictionRequestMutation,
  useRejectPredictionRequestMutation,
  useChangeRequestIconMutation,
  useGetPredictionsQuery,
  useGetPredictionByIdQuery,
  useSetPredictionWinnerMutation,
  useFinishPredictionMutation,
  useExtendPredictionDisputeMutation,
  useGetUsersInfoQuery,
  useGetUsersListQuery,
  useGetUserByIdQuery,
  useGetUserIpsQuery,
  useGetUserCommentsQuery,
  useGetUserBetsQuery,
  useGetUserWalletsQuery,
  useUpdateUserMutation,
  useGetAdminTxsQuery,
  useGetAdminTxByIdQuery,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
} = adminApi;

