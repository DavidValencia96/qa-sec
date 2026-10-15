# 🛡️ QA-Sec Suite Dashboard

> **Plataforma Integral de Auditoría de Seguridad Web y Redes impulsada por Inteligencia Artificial (Gemini AI)**

`QA-Sec Suite Dashboard` es una solución completa para el diseño, ejecución y análisis defensivo de pruebas de ciberseguridad. Integra automatización de navegador headless mediante **Playwright**, análisis de infraestructura de red y generación inteligente de suites de prueba dinámicas potenciadas por la API de **Google Gemini AI**.

---

## 📸 Vista General de la Arquitectura

La plataforma sigue una arquitectura modular desacoplada:

- **Frontend:** Single Page Application (SPA) construida con React, TypeScript y Vite.
- **Backend:** API REST en Node.js y Express estructurada bajo principios de separación de responsabilidades (Controllers, Services, Core Runner e Interceptors).
- **Base de Datos:** MySQL para persistencia de proyectos, suites de prueba, presets de prompts, ejecuciones y hallazgos.
- **Motores de Análisis:** 
  - **Playwright Engine:** Intercepción de tráfico HTTP/HTTPS, inspección de encabezados y análisis de fuga de datos en el cliente.
  - **Network Auditor:** Escaneo y diagnóstico de puertos de infraestructura.
  - **Gemini AI Engine:** Generación de suites personalizadas e interpretación técnica defensiva con resúmenes ejecutivos.

---

## 🚀 Funcionalidades Principales

1. **Diseñador de Pruebas Inteligente (Gemini AI):**
   - Catálogo de **15 plantillas predefinidas de prompts de seguridad** almacenadas en MySQL (CORS, HSTS, fugas en JS, cookies, exposición de paneles, etc.).
   - Capacidad de ingresar prompts personalizados para la generación automática de módulos de prueba.
   - Bloqueo de concurrencia e interfaz interactiva durante la generación de suites.

2. **Escáner Web & Ejecución Automatizada:**
   - Auditoría en tiempo real de URLs objetivo con navegador headless.
   - Detección de encabezados de seguridad faltantes (CSP, CORS, HSTS, X-Frame-Options).
   - Escaneo de archivos sensibles expuestos (`.env`, `.git`, backups, `swagger.json`).
   - Inspección de respuestas en scripts cliente para prevenir fuga de credenciales o API Keys.
   - Control de ejecución con opción para **cancelar/reiniciar análisis en curso**.

3. **Auditoría Defensiva de Red:**
   - Análisis de configuración de hosts e infraestructura.
   - Generación de diagnósticos de riesgo e instrucciones de mitigación asistidas por IA.

4. **Historial de Reportes & Buscador:**
   - Persistencia completa de auditorías web y de red.
   - Visualización de ID de ejecución únicos, URLs objetivo, fecha y total de hallazgos.
   - Filtro dinámico multivariable y modal de inspección detallada de reportes.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend (`/client`)**
- **Core:** React 18, TypeScript, Vite.
- **Estilos:** CSS3 modular con soporte de Temas Oscuros (Cyberpunk/Dark Mode) y Layouts Adaptativos (Flexbox/Grid).
- **Consumo API:** Fetch API con clientes fuertemente tipados.

### **Backend (`/server`)**
- **Core:** Node.js, Express.js, TypeScript.
- **Motor de Pruebas Web:** Playwright.
- **IA & Diagnóstico:** Google Generative AI SDK (`@google/genai`).
- **Base de Datos:** MySQL / `mysql2/promise`.
- **Utilidades:** dotenv, cors.

---

## 📁 Estructura del Proyecto

```text
qa-sec-suite/
│
├── client/                     # Frontend (React + Vite)
│   ├── public/                 # Recursos estáticos
│   └── src/
│       ├── assets/             # Imágenes y SVGs
│       ├── components/
│       │   ├── dashboard/      # Navegación, formularios y barras de progreso
│       │   ├── history/        # Tabla e interfaces del historial de reportes
│       │   ├── network/        # Métricas y tablas de análisis de red
│       │   ├── report/         # Banners de IA y tarjetas de hallazgos
│       │   ├── suite/          # Tarjetas de suites generadas
│       │   ├── AISuiteGenerator.tsx      # Diseñador de Prompts con Gemini
│       │   ├── NetworkConfigAuditor.tsx  # Auditor de Red
│       │   ├── ReportHistory.tsx         # Contenedor de Historial
│       │   └── ReportViewer.tsx          # Visor detallado de resultados
│       ├── services/
│       │   └── api.client.ts   # Mapeo de endpoints de la API Backend
│       ├── App.tsx             # Componente Raíz
│       ├── main.tsx            # Punto de entrada Vite
│       └── index.css           # Estilos globales
│
├── server/                     # Backend (Node.js + Express + TypeScript)
│   └── src/
│       ├── config/             # Conexión MySQL y variables de entorno
│       ├── controllers/        # Controladores REST por dominio
│       ├── core/               # Interceptores HTTP y Runner de Playwright
│       ├── modules/            # Módulos de prueba (Headers, Exposure, Leakage)
│       ├── routes/             # Enrutador principal (api.routes.ts)
│       ├── services/           # Gemini AI, Findings, History, Network Services
│       └── utils/              # Generadores de IDs únicos
│
├── database.sql                # Script de creación de tablas y prompts iniciales
├── package.json                # Scripts raíz del proyecto
└── README.md                   # Documentación técnica

⚙️ Configuración e Instalación
Prerrequisitos
Node.js: >= 18.x

MySQL Server: >= 8.0

Google Gemini API Key: Cuenta activa en Google AI Studio.

1. Base de Datos
Crea la base de datos MySQL y ejecuta el script de inicialización:

Bash
mysql -u tu_usuario -p tu_base_de_datos < database.sql
2. Configuración del Backend (/server)
Dirígete a la carpeta del servidor e instala las dependencias:

Bash
cd server
npm install
Instala los navegadores necesarios para Playwright:

Bash
npx playwright install chromium
Crea un archivo .env en la raíz de /server:

Fragmento de código
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=qa_sec_suite
GEMINI_API_KEY=tu_api_key_de_gemini
Inicia el servidor en modo desarrollo:

Bash
npm run dev
3. Configuración del Frontend (/client)
En una nueva terminal, dirígete a la carpeta del cliente e instala las dependencias:

Bash
cd client
npm install
Inicia el servidor de desarrollo de Vite:

Bash
npm run dev
Abre el navegador en http://localhost:5173.