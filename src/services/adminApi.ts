import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getCookie } from '../utils/cookies';
import { IAdminUser } from '../types';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost/api',
    credentials: 'include',
    prepareHeaders: (headers) => {
      const csrf = getCookie('csrftoken');
      if (csrf) {
        headers.set('X-CSRFToken', csrf);
      }
      return headers;
    },
  }),
  tagTypes: ['AdminUser'],
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
  }),
});

export const {
  useGetAdminUserQuery,
  useLazyGetAdminUserQuery,
  useAdminLoginMutation,
  useSignOutMutation,
} = adminApi;
