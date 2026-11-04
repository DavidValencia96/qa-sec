import { createContext } from 'react';
import type { LanguageContextType } from './translations';

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);