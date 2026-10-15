import net from 'net';
import { COMMON_PORTS } from './portScanner.constants.js';

export interface DiscoveredPort {
  port: number;
  service: string;
  status: 'OPEN' | 'CLOSED';
}

export const sanitizeHost = (host: string): string => {
  return host.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0];
};

export const probePort = (host: string, port: number, timeout = 1200): Promise<DiscoveredPort> => {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isOpen = false;

    socket.setTimeout(timeout);
    socket.on('connect', () => {
      isOpen = true;
      socket.destroy();
    });
    socket.on('timeout', () => socket.destroy());
    socket.on('error', () => socket.destroy());
    socket.on('close', () => {
      resolve({
        port,
        service: COMMON_PORTS[port] || 'Custom Service',
        status: isOpen ? 'OPEN' : 'CLOSED',
      });
    });

    socket.connect(port, host);
  });
};