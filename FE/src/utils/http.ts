import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

const ACCESS_TOKEN_STORAGE_KEY = "accessToken";
const REFRESH_PATH = "/auth/refresh";
const REFRESH_EXCLUDED_PATHS = [
  REFRESH_PATH,
  "/auth/login",
  "/auth/register",
  "/auth/google",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/forgot-password",
  "/auth/reset-password",
];

type RetriableConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

function readAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

function writeAccessToken(token: string | null): void {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  } else {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }
}

const httpClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_API,
  // Send cookies so the BE can read the httpOnly refresh token cookie
  // on /auth/refresh and /auth/logout.
  withCredentials: true,
});

httpClient.interceptors.request.use(
  (config) => {
    const token = readAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Single-flight refresh so concurrent 401s share one /auth/refresh call.
let refreshInFlight: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = httpClient
      .post<{ token: string }>(REFRESH_PATH)
      .then((res) => {
        const next = res.data?.token ?? null;
        writeAccessToken(next);
        return next;
      })
      .catch(() => {
        writeAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

function shouldSkipRefresh(url: string): boolean {
  return REFRESH_EXCLUDED_PATHS.some((path) => url.includes(path));
}

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const url = original?.url ?? "";

    // Only attempt refresh on a 401 for a request we haven't already
    // retried and that wasn't itself the refresh call.
    if (
      status === 401 &&
      original &&
      !original._retry &&
      !shouldSkipRefresh(url)
    ) {
      original._retry = true;
      const next = await refreshAccessToken();
      if (next) {
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${next}`;
        return httpClient.request(original);
      }
    }

    return Promise.reject(error);
  },
);

const _send = async <T>(
  method: string,
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => {
  const response = await httpClient.request<{ data: T }>({
    ...config,
    method,
    url: path,
    data,
  });

  return response.data.data;
};

const get = async <T>(path: string, config?: AxiosRequestConfig): Promise<T> =>
  _send<T>("get", path, undefined, config);

const post = async <T>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => _send<T>("post", path, data, config);

const put = async <T>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => _send<T>("put", path, data, config);

const patch = async <T>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => _send<T>("patch", path, data, config);

const del = async <T>(
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> => _send<T>("delete", path, data, config);

const http = { get, post, put, patch, del };
export default http;
export {
  ACCESS_TOKEN_STORAGE_KEY,
  httpClient,
  readAccessToken,
  writeAccessToken,
};
