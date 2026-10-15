# 🛡️ QA-Sec Suite Dashboard

> **Plataforma Integral de Auditoría de Seguridad Web, Inyección de Inputs y Redes impulsada por Inteligencia Artificial (Gemini AI)**

`QA-Sec Suite Dashboard` es una solución completa para el diseño, ejecución y análisis defensivo de pruebas de ciberseguridad. Integra automatización de navegador headless mediante **Playwright**, auditoría avanzada de desinfección de inputs, análisis de infraestructura de red y generación inteligente de suites de prueba dinámicas potenciadas por la API de **Google Gemini AI**.

---

## 📸 Vista General de la Arquitectura

La plataforma sigue una arquitectura modular desacoplada:

- **Frontend:** Single Page Application (SPA) construida con React 18, TypeScript y Vite.
- **Backend:** API REST en Node.js y Express estructurada bajo principios de separación de responsabilidades (Controllers, Services, Core Runner, Interceptors e Input Evaluators).
- **Base de Datos:** MySQL para la persistencia de proyectos, suites de prueba, presets de prompts generales, catálogo de reglas de auditoría de inputs (`input_prompts`), vectores de inyección (`input_payloads`), ejecuciones, escaneos de red y hallazgos.
- **Motores de Análisis:** 
  - **Playwright Engine:** Intercepción de tráfico HTTP/HTTPS, inspección de encabezados, análisis de fuga de datos en el cliente e inyección automatizada de cargas útiles (*payloads*) en formularios objetivo.
  - **Network Auditor:** Escaneo en tiempo real y diagnóstico de puertos de infraestructura TCP/IP.
  - **Gemini AI Engine:** Generación de suites personalizadas e interpretación técnica defensiva con resúmenes ejecutivos y dictámenes de mitigación.

---

## 🚀 Funcionalidades Principales

1. **Diseñador de Pruebas Inteligente (Gemini AI):**
   - Catálogo de **16 plantillas predefinidas de prompts generales** almacenadas en MySQL (`prompt_presets`) para auditorías de CORS, HSTS, fugas en JS, cookies, exposición de paneles, etc.
   - Capacidad de ingresar prompts personalizados para la generación automática de módulos de prueba.
   - Bloqueo de concurrencia e interfaz interactiva durante la generación de suites.

2. **Escáner Web & Ejecución Automatizada:**
   - Auditoría en tiempo real de URLs objetivo con navegador headless (Playwright).
   - Detección de encabezados de seguridad faltantes (CSP, CORS, HSTS, X-Frame-Options).
   - Escaneo de archivos sensibles expuestos (`.env`, `.git`, backups, `swagger.json`).
   - Inspección de respuestas en scripts cliente para prevenir fuga de credenciales o API Keys.
   - Control de ejecución con opción para **cancelar/reiniciar análisis en curso**.

3. **Módulo de Auditoría de Inyección & Inputs Sec (OWASP Top 10):**
   - Catálogo de **18 reglas de auditoría** organizadas de forma estricta por orden de prioridad (Severidad Crítica a Baja):
     - *Command Injection, SQLi (Básica, Ciega y Auth Bypass), NoSQLi, Path Traversal / LFI, SSRF, SSTI, XXE, XSS (Reflejado y WAF Bypass), CRLF Injection, JSON Schema Pollution, Auth Bypass / Nulos, Integer Overflow, Null Byte, Open Redirect y Lógica de Negocio*.
   - **Trazabilidad completa de Payloads:** Mapeo relacional dinámico entre las reglas seleccionadas en la interfaz y la tabla de datos `input_payloads`.
   - Inyección automatizada sobre selectores XPath / CSS en formularios con captura e inspección de respuestas HTTP del servidor (códigos `200`, `204`, `500`, etc.).

4. **Auditoría Defensiva de Red:**
   - Análisis de configuración e identificación de superficie expuesta en hosts e infraestructura.
   - Escaneo TCP de puertos comunes y detección de banners de servicio.
   - Generación de diagnósticos de riesgo e instrucciones de mitigación asistidas por IA.

5. **Historial de Reportes & Buscador:**
   - Persistencia completa de auditorías web, inyecciones de inputs y escaneos de red.
   - Visualización de ID de ejecución únicos, URLs objetivo, fecha y total de hallazgos.
   - Filtro dinámico multivariable y modal de inspección detallada de reportes con evidencia técnica.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend (`/client`)**
- **Core:** React 18, TypeScript, Vite.
- **Estilos:** CSS3 modular con soporte de Temas Oscuros (Cyberpunk/Dark Mode) y Layouts Adaptativos (Flexbox/Grid).
- **Consumo API:** Fetch API con clientes fuertemente tipados.

### **Backend (`/server`)**
- **Core:** Node.js, Express.js, TypeScript.
- **Motor de Pruebas Web & Inyección:** Playwright.
- **IA & Diagnóstico:** Google Generative AI SDK (`@google/genai`).
- **Base de Datos:** MySQL / `mysql2/promise`.
- **Utilidades:** dotenv, cors.

---

## 📁 Estructura del Proyecto

```text
qa-sec-suite/
│
├── client/                               # Frontend (React + Vite)
│   ├── public/                           # Recursos estáticos e íconos
│   └── src/
│       ├── assets/                       # Recursos visuales y SVGs
│       ├── components/
│       │   ├── dashboard/                # Navegación, formularios, InputInjectionAuditor y barras de progreso
│       │   ├── history/                  # Tabla e interfaces del historial de reportes
│       │   ├── network/                  # Métricas, diagnósticos e interfaces de red
│       │   ├── report/                   # Banners de IA, tarjetas de hallazgos y evidencias
│       │   ├── suite/                    # Tarjetas de suites generadas
│       │   ├── AISuiteGenerator.tsx      # Diseñador de Prompts con Gemini AI
│       │   ├── InputSuiteGenerator.tsx   # Configurador de Auditorías de Sanitización
│       │   ├── NetworkConfigAuditor.tsx  # Auditor de Red
│       │   ├── ReportHistory.tsx         # Contenedor de Historial
│       │   └── ReportViewer.tsx          # Visor detallado de resultados
│       ├── services/
│       │   └── api.client.ts             # Mapeo de endpoints de la API Backend
│       ├── App.tsx                       # Componente Raíz
│       ├── main.tsx                      # Punto de entrada Vite
│       └── index.css                     # Estilos globales
│
├── server/                               # Backend (Node.js + Express + TypeScript)
│   └── src/
│       ├── config/                       # Conexión MySQL y variables de entorno
│       ├── controllers/                  # Controladores REST por dominio (project, scanner, portScan, history, prompts)
│       │   ├── history/                  # Helpers de controladores de historial
│       │   ├── portScan/                 # Helpers de escaneo de red
│       │   ├── project/                  # Helpers de proyectos y consulta de presets
│       │   └── scanner/                  # Helpers de ejecución de escaneo
│       ├── core/                         # Motor de ejecución
│       │   ├── interceptor/              # Interceptores de red HTTP
│       │   └── runner/                   # Evaluadores de inputs, descubrimiento de formularios y contexto Playwright
│       ├── modules/                      # Módulos de prueba (Headers, Exposure, Leakage)
│       ├── routes/                       # Enrutador principal (api.routes.ts)
│       ├── services/                     # Servicios (Gemini AI, Findings, History, Network, InputPayloads)
│       └── utils/                        # Generadores de IDs únicos
│
├── database.sql                          # Script de creación de tablas, catálogo OWASP Top 10 y payloads
├── package.json                          # Scripts raíz del proyecto
└── README.md                             # Documentación técnica
```

---

## ⚙️ Configuración e Instalación

### Prerrequisitos
- **Node.js: >= 18.x**

- **MySQL Server: >= 8.0**

**Google Gemini API Key: Cuenta activa en Google AI Studio.**

### 2. Base de Datos##
Crea la base de datos MySQL e importa el script de estructura y datos iniciales:

Bash
mysql -u tu_usuario -p < database.sql
(Nota: El script creará la base de datos qa_sec_db, las tablas relacionales y cargará las 18 reglas de auditoría ordenadas por prioridad junto a sus cargas útiles asociadas).

### 2. Configuración del Backend (/server)
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
DB_NAME=qa_sec_db
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
Abre tu navegador e ingresa a http://localhost:5173.