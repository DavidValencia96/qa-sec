import { DiscoveredPort } from '../../services/portScanner.service.js';

export const validateTargetHost = (targetHost: unknown): string | null => {
  if (!targetHost || typeof targetHost !== 'string' || !targetHost.trim()) {
    return null;
  }
  return targetHost.trim();
};

export const filterOpenPorts = (scannedPorts: DiscoveredPort[]): DiscoveredPort[] => {
  return scannedPorts.filter((p) => p.status === 'OPEN');
};