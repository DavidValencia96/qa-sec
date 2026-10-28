import type { AuthenticatedRequest } from './auth.types.js';

export const extractTesterEmail = (req: AuthenticatedRequest): string => {
  const email = req.user?.email?.trim().toLowerCase();
  return email && email.length > 0 ? email : 'visitante';
};

export const buildTesterFilterClause = (req: AuthenticatedRequest): { sqlClause: string; params: string[] } => {
  const role = req.user?.role;
  const email = req.user?.email?.trim().toLowerCase();

  // ADMIN y AUDITOR inspeccionan el 100% de los registros
  if (role === 'ADMIN' || role === 'AUDITOR') {
    return { sqlClause: '', params: [] };
  }

  // VIEWER autenticado solo inspecciona sus propias ejecuciones
  if (role === 'VIEWER' && email) {
    return { sqlClause: 'WHERE LOWER(tester_email) = ?', params: [email] };
  }

  // Petición anónima o sin sesión iniciada: solo registros públicos de visitante
  return { sqlClause: 'WHERE tester_email = ?', params: ['visitante'] };
};