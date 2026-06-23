import type { AxiosRequestConfig } from "axios";
import { httpClient } from "@/utils/http";

async function _send<T>(
  method: string,
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await httpClient.request<T>({
    ...config,
    method,
    url: path,
    data,
  });
  return response.data;
}

const get = <T>(path: string, config?: AxiosRequestConfig) =>
  _send<T>("get", path, undefined, config);

const post = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
  _send<T>("post", path, data, config);

const put = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
  _send<T>("put", path, data, config);

const patch = <T>(path: string, data?: unknown, config?: AxiosRequestConfig) =>
  _send<T>("patch", path, data, config);

const del = <T>(path: string, config?: AxiosRequestConfig) =>
  _send<T>("delete", path, undefined, config);

const http = { get, post, put, patch, del };
export default http;
