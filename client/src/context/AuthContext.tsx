import React, { useState, useEffect } from 'react';
import type { AuthUser } from '../components/auth/auth.types.js';
import { AuthContext } from './auth.context.js';
import { requestOtpApi, verifyOtpApi, fetchCurrentUserApi } from '../services/auth.client.js';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('qa_sec_token'));
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(localStorage.getItem('qa_sec_token')));

  useEffect(() => {
    let active = true;

    if (!token) return;

    fetchCurrentUserApi(token).then((userData) => {
      if (!active) return;
      setUser(userData);
      if (!userData) {
        localStorage.removeItem('qa_sec_token');
        setToken(null);
      }
      setIsLoading(false);
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
    setUser(result.user);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('qa_sec_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, requestOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};