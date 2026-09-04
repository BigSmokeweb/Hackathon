/**
 * Centralized API client.
 * All fetch calls in the app should use this module so the base URL
 * is sourced from NEXT_PUBLIC_API_BASE_URL and never hardcoded.
 */

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000/api/v1';

type FetchOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  token?: string;
};

async function request<T = unknown>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, token, headers: extraHeaders, ...rest } = options;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = { message: res.statusText };
    }
    throw Object.assign(new Error(`API ${res.status}: ${path}`), { status: res.status, body: errorBody });
  }

  // 204 No Content — return empty object
  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

export const api = {
  get: <T = unknown>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', token }),

  post: <T = unknown>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body, token }),

  patch: <T = unknown>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PATCH', body, token }),

  delete: <T = unknown>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
};
