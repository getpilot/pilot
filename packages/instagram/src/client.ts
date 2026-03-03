import axios, { type AxiosRequestConfig, type Method } from "axios";
import {
  normalizeInstagramAxiosError,
  parseRetryAfterSeconds,
} from "./errors";

const DEFAULT_MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;
const DEFAULT_TIMEOUT_MS = 10_000;

export const IG_API_VERSION = "v25.0";
export const GRAPH_BASE_URL = "https://graph.instagram.com";
export const LOGIN_GRAPH_BASE_URL = "https://graph.instagram.com";
export const FACEBOOK_GRAPH_BASE_URL = "https://graph.facebook.com";
export const AUTH_BASE_URL = "https://api.instagram.com";

export type InstagramRequestParams = {
  method: Method;
  url: string;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  data?: unknown;
  timeoutMs?: number;
  maxRetries?: number;
  postRequestDelayMs?: number;
};

export type InstagramRequestResult<T> = {
  status: number;
  data: T;
  headers: Record<string, unknown>;
};

export function graphUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${GRAPH_BASE_URL}${normalized}`;
}

export function loginGraphUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${LOGIN_GRAPH_BASE_URL}${normalized}`;
}

export function facebookGraphUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${FACEBOOK_GRAPH_BASE_URL}${normalized}`;
}

export function authUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${AUTH_BASE_URL}${normalized}`;
}

export async function instagramRequest<T = unknown>(
  params: InstagramRequestParams,
): Promise<InstagramRequestResult<T>> {
  const maxRetries = params.maxRetries ?? DEFAULT_MAX_RETRIES;
  const timeoutMs = params.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const requestConfig: AxiosRequestConfig = {
        method: params.method,
        url: params.url,
        headers: params.headers,
        params: params.params,
        data: params.data,
        timeout: timeoutMs,
        validateStatus: () => true,
      };

      const response = await axios.request<T>(requestConfig);
      const headers = (response.headers ?? {}) as Record<string, unknown>;

      const shouldRetry =
        response.status === 429 || (response.status >= 500 && response.status);

      if (shouldRetry && attempt < maxRetries - 1) {
        const retryAfter = parseRetryAfterSeconds({
          headers,
          data: response.data,
        });
        const delayMs = retryAfter
          ? retryAfter * 1000
          : BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(delayMs);
        continue;
      }

      if (params.postRequestDelayMs && params.postRequestDelayMs > 0) {
        await sleep(params.postRequestDelayMs);
      }

      return {
        status: response.status,
        data: response.data,
        headers,
      };
    } catch (error) {
      if (attempt < maxRetries - 1) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        await sleep(delayMs);
        continue;
      }
      throw normalizeInstagramAxiosError(error);
    }
  }

  throw normalizeInstagramAxiosError(new Error("Instagram retry loop ended."));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
