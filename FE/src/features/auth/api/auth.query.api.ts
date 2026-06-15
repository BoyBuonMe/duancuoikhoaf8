import { createApi } from "@reduxjs/toolkit/query/react";
import type { AuthUser } from "@/features/auth/model/auth.types";
import { axiosBaseQuery } from "@/utils/axiosBaseQuery";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Me"],
  endpoints: (builder) => ({
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: "/users/me", method: "GET" }),
      transformResponse: (response: { user: AuthUser }) => response.user,
      providesTags: ["Me"],
    }),
  }),
});

export const { useGetMeQuery, useLazyGetMeQuery } = authApi;
