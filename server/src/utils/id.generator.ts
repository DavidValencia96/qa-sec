import { randomUUID } from 'crypto';

export const generateUniqueId = (): string => {
  return randomUUID();
};

export const generateId = (prefix: string = 'id'): string => {
  const shortUuid = randomUUID().split('-')[0];
  return `${prefix}_${shortUuid}`;
};