// src/lib/authFetch.ts
// Utility for making authenticated API calls with JWT from localStorage

export async function authFetch(
  input: RequestInfo,
  init: RequestInit = {}
): Promise<Response> {
  // Get JWT from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = new Headers(init.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  // Always send JSON if not specified
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return fetch(input, {
    ...init,
    headers,
  });
}

// Example usage:
// const response = await authFetch('/api/protected', { method: 'GET' });
// const data = await response.json();
