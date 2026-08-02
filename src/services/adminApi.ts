import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { IAdminUser, IPredictionRequestItem } from '../types';

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
  tagTypes: ['AdminUser', 'PredictionRequests'],
  endpoints: (builder) => ({
    getAdminUser: builder.query<IAdminUser, void>({
      query: () => 'auth/user',
      providesTags: ['AdminUser'],
    }),
    adminLogin: builder.mutation<{ ok: boolean }, { username: string; password: string }>({
      query: (body) => ({
        url: 'auth/admin/login',
        method: 'POST',
        body,
      }),
    }),
    signOut: builder.mutation<void, void>({
      query: () => ({
        url: 'auth/user',
        method: 'DELETE',
      }),
      invalidatesTags: ['AdminUser'],
    }),
    getPredictionRequests: builder.query<IPredictionRequestItem[], void>({
      query: () => 'core/admin/requests',
      providesTags: ['PredictionRequests'],
    }),
    approvePredictionRequest: builder.mutation<void, number>({
      query: (id) => ({
        url: `core/admin/requests/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: ['PredictionRequests'],
    }),
    rejectPredictionRequest: builder.mutation<void, { id: number; reason: string }>({
      query: ({ id, reason }) => ({
        url: `core/admin/requests/${id}/reject`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: ['PredictionRequests'],
    }),
    changeRequestIcon: builder.mutation<void, number>({
      query: (id) => ({
        url: `core/admin/requests/${id}`,
        method: 'PUT',
        body: { icon: true },
      }),
      invalidatesTags: ['PredictionRequests'],
    }),
  }),
});

export const {
  useGetAdminUserQuery,
  useLazyGetAdminUserQuery,
  useAdminLoginMutation,
  useSignOutMutation,
  useGetPredictionRequestsQuery,
  useApprovePredictionRequestMutation,
  useRejectPredictionRequestMutation,
  useChangeRequestIconMutation,
} = adminApi;
