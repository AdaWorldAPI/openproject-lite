// In production, API is same origin at /api
// In development, can override with VITE_API_URL
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

async function request(method: string, path: string, body?: unknown): Promise<Response> {
  const opts: RequestInit = {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  };
  if (body !== undefined) {
    opts.body = JSON.stringify(body);
  }
  return fetch(`${BASE_URL}${path}`, opts);
}

export const api = {
  get: (path: string) => request('GET', path),
  post: (path: string, body: unknown) => request('POST', path, body),
  patch: (path: string, body: unknown) => request('PATCH', path, body),
  delete: (path: string) => request('DELETE', path),
};
