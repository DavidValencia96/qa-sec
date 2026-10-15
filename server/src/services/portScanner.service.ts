import { COMMON_PORTS } from './network/portScanner.constants.js';
import { sanitizeHost, probePort, type DiscoveredPort } from './network/portScanner.helpers.js';

export type { DiscoveredPort };

export const scanTargetPortsReal = async (targetHost: string): Promise<DiscoveredPort[]> => {
  const host = sanitizeHost(targetHost);
  const portList = Object.keys(COMMON_PORTS).map(Number);
  const tasks = portList.map((p) => probePort(host, p));
  return await Promise.all(tasks);
};