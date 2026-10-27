import { Request, Response } from 'express';

// Mapa en memoria RAM: sessionId -> lastPingTimestamp
const activeSessions = new Map<string, number>();

export const handleHeartbeat = (req: Request, res: Response) => {
  const { sessionId } = req.body;
  const now = Date.now();

  if (sessionId && typeof sessionId === 'string') {
    activeSessions.set(sessionId, now);
  }

  // Elimina sesiones inactivas (más de 30 segundos sin enviar heartbeat)
  for (const [id, lastSeen] of activeSessions.entries()) {
    if (now - lastSeen > 30000) {
      activeSessions.delete(id);
    }
  }

  // Retorna la cantidad real de usuarios activos
  res.json({
    success: true,
    onlineUsers: activeSessions.size,
  });
};