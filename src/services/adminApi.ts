import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import {
  IAdminUser,
  IAdminUsersInfo,
  IPredictionRequestItem,
  IUserItem,
  IAdminUserUpdatePayload,
  IAdminUserIpLog,
  IAdminUserComment,
  IAdminUserBet,
  IAdminUserDepositWallet,
} from '../types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || '/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrf = getCookie('csrftoken');
      if (csrf) {
        headers.set('X-CSRFToken', csrf);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminUser', 'PredictionRequests', 'Users'],
  endpoints: (builder) => ({
    getAdminUser: builder.query<IAdminUser, void>({
      query: () => 'auth/user',
      providesTags: ['AdminUser'],
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
    }),
    getPredictionRequestById: builder.query<IPredictionRequestItem, number>({
      query: (id) => `admin/requests/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'PredictionRequests', id }],
    }),
    approvePredictionRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/requests/${id}/approve`,
        method: 'POST',
      }),
    }),
    rejectPredictionRequest: builder.mutation<void, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `admin/requests/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
    }),
    changeRequestIcon: builder.mutation<void, number>({
      query: (id) => ({
        url: `admin/requests/${id}`,
        method: 'PUT',
        body: { icon: true },
      }),
    }),
    getAdminUsersInfo: builder.query<IAdminUsersInfo, void>({
      query: () => 'admin/users/info',
      providesTags: ['Users'],
    }),
    getAdminUsersList: builder.query<IUserItem[], { search?: string } | void>({
      query: (params) => {
        if (params && typeof params === 'object' && params.search) {
          return `admin/users?search=${encodeURIComponent(params.search)}`;
        }
        return 'admin/users';
      },
      providesTags: ['Users'],
    }),
    getAdminUserById: builder.query<IUserItem, number>({
      query: (id) => `admin/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    getAdminUserIps: builder.query<IAdminUserIpLog[], number>({
      query: (id) => `admin/users/${id}/ips`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    getAdminUserComments: builder.query<IAdminUserComment[], number>({
      query: (id) => `admin/users/${id}/comments`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    getAdminUserBets: builder.query<IAdminUserBet[], number>({
      query: (id) => `admin/users/${id}/bets`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    getAdminUserWallets: builder.query<IAdminUserDepositWallet[], number>({
      query: (id) => `admin/users/${id}/wallets`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    updateAdminUser: builder.mutation<IUserItem, IAdminUserUpdatePayload>({
      query: ({ id, ...body }) => ({
        url: `admin/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Users', id }, 'Users'],
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
  useGetAdminUsersInfoQuery,
  useGetAdminUsersListQuery,
  useGetAdminUserByIdQuery,
  useGetAdminUserIpsQuery,
  useGetAdminUserCommentsQuery,
  useGetAdminUserBetsQuery,
  useGetAdminUserWalletsQuery,
  useUpdateAdminUserMutation,
} = adminApi;
