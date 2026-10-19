import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());

// 1. MALA CONFIGURACIÓN CORS (Permite Origin: null y refleja orígenes arbitrarios con credenciales)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    // Vulnerabilidad: Refleja dinámicamente cualquier Origin y permite credenciales
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// 2. MIDDLEWARE JWT VULNERABLE (Acepta algoritmo "none" y secret débil "123456")
app.get('/api/users', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Token no provisto' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vulnerabilidad 1: Permite el algoritmo "none" sin firma
    const decoded = jwt.decode(token, { complete: true });
    if (decoded && decoded.header.alg === 'none') {
      return res.json({ message: 'Acceso concedido mediante alg: none', user: decoded.payload });
    }

    // Vulnerabilidad 2: Firma verificada con secreto débil "123456"
    const verified = jwt.verify(token, '123456');
    return res.json({ message: 'Acceso concedido con secreto débil', user: verified });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido', details: err.message });
  }
});

app.listen(4000, () => {
  console.log('🚀 Servidor de prueba vulnerable corriendo en http://localhost:4000/api/users');
});

// Token de prueba:  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlVzdWFyaW8gUHJ1ZWJhIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNTE2MjM5MDAwfQ.G3_vT6E2K_sT_1I8uGk7W32H8J7L9X0Y1Z2A3B4C5D6