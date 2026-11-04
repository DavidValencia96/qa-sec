import React, { useState, useEffect } from 'react';
import type { AuthUser } from '../components/auth/auth.types.js';
import { AuthContext } from './auth.context.js';
import { requestOtpApi, verifyOtpApi, fetchCurrentUserApi, logoutApi } from '../services/auth.client.js';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('qa_sec_token'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;

    // Consulta sesión mediante la cookie HttpOnly o token residual
    fetchCurrentUserApi(token)
      .then((userData) => {
        if (!active) return;
        if (userData) {
          setUser({
            ...userData,
            allowed_modules: Array.isArray(userData.allowed_modules) ? userData.allowed_modules : [],
          });
        } else {
          localStorage.removeItem('qa_sec_token');
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const requestOtp = async (email: string): Promise<boolean> => {
    return await requestOtpApi(email);
  };

  const verifyOtp = async (email: string, code: string): Promise<boolean> => {
    const result = await verifyOtpApi(email, code);
    if (!result) return false;
    localStorage.setItem('qa_sec_token', result.token);
    setToken(result.token);
    setUser({
      ...result.user,
      allowed_modules: Array.isArray(result.user.allowed_modules) ? result.user.allowed_modules : [],
    });
    return true;
  };

  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('qa_sec_token');
    setToken(null);
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};