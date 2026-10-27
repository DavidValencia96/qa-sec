import { useContext } from 'react';
import { AuthContext } from './auth.context.js';
import type { AuthContextType } from '../components/auth/auth.types.js';

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return ctx;
};