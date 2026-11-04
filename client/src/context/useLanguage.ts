import { useContext } from 'react';
import { LanguageContext } from './language.context';
import type { LanguageContextType } from './translations';

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe usarse dentro de un LanguageProvider');
  }
  return context;
};