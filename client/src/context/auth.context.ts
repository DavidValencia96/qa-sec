import { createContext } from 'react';
import type { AuthContextType } from '../components/auth/auth.types.js';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);