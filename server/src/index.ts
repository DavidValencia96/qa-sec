import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config/env.js';
import { testDbConnection } from './config/database.js';
import apiRouter from './routes/api.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// 1. Endpoint de verificación de salud
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 2. Rutas de la API Backend
app.use('/api', apiRouter);

// 3. Servir Frontend estático compilado (client/dist)
// __dirname apunta directamente al directorio actual en CommonJS
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