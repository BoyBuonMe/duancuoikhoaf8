import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import { httpClient } from "@/utils/http";

export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: unknown;
  params?: unknown;
};

export type AxiosBaseQueryError = {
  status?: number;
  message: string;
};

/**
 * RTK Query baseQuery backed by the existing httpClient (axios).
 * Inherits all interceptors: auth token injection, silent token refresh on 401.
 */
export const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError> =>
  async ({ url, method = "GET", data, params }) => {
    try {
      const result = await httpClient({ url, method, data, params });
      return { data: result.data };
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      return {
        error: {
          status: axiosError.response?.status,
          message:
            axiosError.response?.data?.message ??
            axiosError.message ??
            "Unknown error",
        },
      };
    }
  };
