import { randomUUID } from 'crypto';

export const generateUniqueId = (): string => {
  return randomUUID();
};