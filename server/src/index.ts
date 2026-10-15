import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { testDbConnection } from './config/database.js';
import apiRouter from './routes/api.routes.js'; // 👈 Importación por defecto (sin llaves)

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const startServer = async (): Promise<void> => {
  await testDbConnection();
  app.listen(config.port, () => {
    console.log(`[+] Servidor QA-Sec-Suite corriendo en el puerto: ${config.port}`);
  });
};

startServer();