import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { config } from './config/env.js';
import { testDbConnection } from './config/database.js';
import apiRouter from './routes/api.routes.js';

const app = express();

// Indispensable en Render/proxies reversos para que rate-limit reconozca la IP real
app.set('trust proxy', 1);

// Hardening completo de cabeceras HTTP de seguridad
app.use(
  helmet({
    // Permite la descarga y visualización de reportes HTML generados dinámicamente
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },

    // Protege contra Clickjacking permitiendo marcos del mismo dominio
    frameguard: { action: 'sameorigin' },

    // Forzado de HTTPS en producción (Helmet no afecta http://localhost)
    hsts: {
      maxAge: 31536000, // 1 año
      includeSubDomains: true,
      preload: true,
    },

    // Previene la filtración de URLs en peticiones a dominios externos
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },

    // Bloquea archivos de políticas entre dominios no autorizados
    permittedCrossDomainPolicies: { permittedPolicies: 'none' },

    // Previene sniffing de tipos MIME
    noSniff: true,

    // Remueve explícitamente el encabezado X-Powered-By
    hidePoweredBy: true,
  })
);

app.use(cors());
app.use(express.json());

// 1. Endpoint de verificación de salud
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 2. Rutas de la API Backend
app.use('/api', apiRouter);

// 3. Servir Frontend estático compilado (client/dist)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// 4. Redirección SPA para rutas de la aplicación React
app.get('*', (_req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

const startServer = async (): Promise<void> => {
  await testDbConnection();
  app.listen(config.port, () => {
    console.log(`[+] Servidor QA-Sec-Suite corriendo en el puerto: ${config.port}`);
  });
};

startServer();