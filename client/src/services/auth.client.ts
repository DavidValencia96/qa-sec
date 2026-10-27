import type { AuthUser } from '../components/auth/auth.types.js';

const API_BASE = '/api/auth';

const getHeaders = (token?: string | null): HeadersInit => ({
  'Content-Type': 'application/json',
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

export const requestOtpApi = async (email: string): Promise<boolean> => {
  const res = await fetch(`${API_BASE}/request-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  return Boolean(data.success);
};

export const verifyOtpApi = async (
  email: string,
  code: string
): Promise<{ token: string; user: AuthUser } | null> => {
  const res = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, code }),
  });
  const data = await res.json();
  return data.success ? { token: data.token, user: data.user } : null;
};

export const fetchCurrentUserApi = async (token: string): Promise<AuthUser | null> => {
  try {
    const res = await fetch(`${API_BASE}/me`, { headers: getHeaders(token) });
    const data = await res.json();
    return data.success ? data.user : null;
  } catch {
    return null;
  }
};