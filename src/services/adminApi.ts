import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
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
} from '../types';
import { setPredictionRequests, upsertPredictionRequest } from '../store/slices/predictionsSlice';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrf = getCookie('csrftoken');
      if (csrf) headers.set('X-CSRFToken', csrf);
      return headers;
    },
  }),
  tagTypes: ['UsersList', 'AdminPredictions', 'PredictionRequests', 'Withdraw'],
  endpoints: (builder) => ({
    getAdminUser: builder.query<IAdminUser, void>({
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

    getPredictionRequests: builder.query<IPredictionRequestItem[], void>({
      query: () => 'admin/requests',
      providesTags: ['PredictionRequests'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (data && Array.isArray(data)) dispatch(setPredictionRequests(data));
        } catch { }
      },
    }),
    getPredictionRequestById: builder.query<IPredictionRequestItem, number>({
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
      invalidatesTags: ['PredictionRequests'],
    }),
    rejectPredictionRequest: builder.mutation<void, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `admin/requests/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['PredictionRequests'],
    }),
    changeRequestIcon: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/requests/${id}`,
        method: 'PUT',
        body: { icon: true },
      }),
    }),

    getAdminPredictions: builder.query<IPredictionItem[], { phase?: string } | void>({
      query: (params) => {
        if (params && typeof params === 'object' && params.phase) {
          return `admin/predictions?phase=${encodeURIComponent(params.phase)}`;
        }
        return 'admin/predictions';
      },
      providesTags: ['AdminPredictions'],
    }),
    getAdminPredictionById: builder.query<IPredictionItem, number>({
      query: (id) => `admin/predictions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'AdminPredictions', id }],
    }),
    setPredictionWinner: builder.mutation<IPredictionItem, { predictionId: number; choiceId: number }>({
      query: ({ predictionId, choiceId }) => ({
        url: `admin/predictions/${predictionId}/set_winner`,
        method: 'POST',
        body: { choice_id: choiceId },
      }),
      invalidatesTags: ['AdminPredictions'],
    }),
    getAdminUsersInfo: builder.query<IAdminUsersInfo, void>({
      query: () => 'admin/users/info',
    }),
    getAdminUsersList: builder.query<IUserItem[], { search?: string } | void>({
      query: (params) => {
        if (params && typeof params === 'object' && params.search) {
          return `admin/users?search=${encodeURIComponent(params.search)}`;
        }
        return 'admin/users';
      },
      providesTags: ['UsersList'],
    }),
    getAdminUserById: builder.query<IUserItem, number>({
      query: (id) => `admin/users/${id}`,
    }),
    getAdminUserIps: builder.query<IAdminUserIpLog[], number>({
      query: (id) => `admin/users/${id}/ips`,
    }),
    getAdminUserComments: builder.query<IAdminUserComment[], number>({
      query: (id) => `admin/users/${id}/comments`,
    }),
    getAdminUserBets: builder.query<IAdminUserBet[], number>({
      query: (id) => `admin/users/${id}/bets`,
    }),
    getAdminUserWallets: builder.query<IAdminUserDepositWallet[], number>({
      query: (id) => `admin/users/${id}/wallets`,
    }),
    updateAdminUser: builder.mutation<IUserItem, IAdminUserUpdatePayload>({
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
          adminApi.util.updateQueryData('getAdminUserById', id, (draft) => {
            if (draft) Object.assign(draft, patch);
          })
        );

        try {
          const { data: updatedUser } = await queryFulfilled;
          if (updatedUser) {
            dispatch(
              adminApi.util.updateQueryData('getAdminUserById', id, (draft) => {
                if (draft) Object.assign(draft, updatedUser);
              })
            );
          }
        } catch {
          patchResultDetail.undo();
        }
      },
    }),
  }),
});

export const {
  useGetAdminUserQuery,
  useAdminLoginMutation,
  useSignOutMutation,
  useGetPredictionRequestsQuery,
  useGetPredictionRequestByIdQuery,
  useApprovePredictionRequestMutation,
  useRejectPredictionRequestMutation,
  useChangeRequestIconMutation,
  useGetAdminPredictionsQuery,
  useGetAdminPredictionByIdQuery,
  useSetPredictionWinnerMutation,
  useGetAdminUsersInfoQuery,
  useGetAdminUsersListQuery,
  useGetAdminUserByIdQuery,
  useGetAdminUserIpsQuery,
  useGetAdminUserCommentsQuery,
  useGetAdminUserBetsQuery,
  useGetAdminUserWalletsQuery,
  useUpdateAdminUserMutation,
} = adminApi;
