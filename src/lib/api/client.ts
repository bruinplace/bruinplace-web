import { getApiRoot } from "./env";

const defaultHeaders: HeadersInit = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

export type ApiRequestInit = Omit<RequestInit, "body"> & {
  body?: Record<string, unknown> | unknown[];
};

export type ApiBody = Record<string, unknown> | unknown[];

async function request<T = unknown>(
  path: string,
  init?: ApiRequestInit
): Promise<T> {
  const root = getApiRoot();
  const url = path.startsWith("/") ? `${root}${path}` : `${root}/${path}`;
  const { body, ...rest } = init ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: { ...defaultHeaders, ...rest.headers },
    body: body != null ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) return res.json() as Promise<T>;
  return res.text() as Promise<T>;
}

/**
 * API client. Uses env: NEXT_PUBLIC_API_BASE_URL.
 * Use api(path, init) for custom requests, or api.get / api.post / etc.
 */
export const api = Object.assign(request, {
  get: <T = unknown>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "GET" } as ApiRequestInit),
  post: <T = unknown>(path: string, body?: ApiBody, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", body } as ApiRequestInit),
  put: <T = unknown>(path: string, body?: ApiBody, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PUT", body } as ApiRequestInit),
  patch: <T = unknown>(path: string, body?: ApiBody, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PATCH", body } as ApiRequestInit),
  delete: <T = unknown>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" } as ApiRequestInit),
});
