# 🛡️ QA-Sec Suite Dashboard

> **Plataforma Integral de Auditoría de Ciberseguridad Web, SAST, Pruebas de Estrés DoS, Redes y Radar CVE impulsada por Inteligencia Artificial (Gemini AI)**

`QA-Sec Suite Dashboard` es una solución enterprise para el diseño, ejecución, análisis defensivo y exportación técnica de auditorías de seguridad. Integra automatización de navegador headless con **Playwright**, análisis estático de código (**SAST** & Secret Scanning), pruebas de carga y resiliencia DoS con cabeceras/payloads configurables[cite: 3], escaneo de infraestructura TCP/IP, radar de vulnerabilidades CVE y generación inteligente de suites de prueba y diagnósticos ejecutivos potenciados por **Google Gemini AI**.

---

## 📸 Vista General de la Arquitectura

La plataforma sigue una arquitectura modular desacoplada y fuertemente tipada en TypeScript:

- **Frontend:** Single Page Application (SPA) construida con React 18, TypeScript y Vite.
- **Backend:** API REST en Node.js y Express basada en capas con separación de responsabilidades (Controllers, Services, Core Runner, Interceptors, Evaluators y Formatters).
- **Base de Datos:** MySQL para la persistencia centralizada de proyectos, suites de prueba, presets de prompts, reglas OWASP Top 10 (`input_prompts`), vectores de inyección (`input_payloads`), auditorías SAST, pruebas de estrés y escaneos de red.
- **Motores de Análisis & Auditoría:**
  - **Playwright Engine:** Intercepción de tráfico HTTP/HTTPS, inspección de encabezados, análisis de fuga de datos en cliente e inyección automatizada de cargas útiles (*payloads*) en formularios objetivo.
  - **Load Testing Engine:** Motor asíncrono de ráfagas paralelas de peticiones para evaluación de resiliencia y defensas de Rate Limiting (OWASP API4:2023).
  - **SAST & Secret Scanner:** Análisis de código estático, detección de secretos/API Keys en crudo y escaneo de vulnerabilidades en dependencias.
  - **Network Auditor:** Escaneo TCP multi-puerto y detección de superficie expuesta en infraestructura.
  - **CVE Radar:** Feed de ciberamenazas y enriquecimiento de vulnerabilidades conocidas.
  - **Gemini AI Engine:** Diagnósticos ejecutivos, resúmenes narrativos de ejecución, evaluación de resiliencia y sugerencias de refactorización defensiva.

---

## 🚀 Funcionalidades Principales

1. **Escáner & Diseñador de Pruebas Inteligente (Gemini AI):**
   - Catálogo de **16 plantillas predefinidas de prompts generales** almacenadas en MySQL (`prompt_presets`) para auditorías de CORS, HSTS, fugas en JS, cookies, exposición de paneles, etc.
   - Generación automática de módulos de prueba a partir de prompts personalizados.
   - Auditoría automatizada con Playwright de URLs objetivo, detección de encabezados faltantes (CSP, HSTS, X-Frame-Options) y escaneo de archivos sensibles expuestos (`.env`, `.git`, backups, `swagger.json`).

2. **Módulo de Auditoría de Inyección & Inputs Sec (OWASP Top 10):**
   - Catálogo de **18 reglas de auditoría** organizadas de mayor a menor severidad: *Command Injection, SQLi (Básica, Ciega y Auth Bypass), NoSQLi, Path Traversal / LFI, SSRF, SSTI, XXE, XSS, CRLF Injection, JSON Schema Pollution, Auth Bypass, Integer Overflow, Null Byte, Open Redirect y Lógica de Negocio*.
   - Mapeo relacional dinámico entre las reglas seleccionadas e `input_payloads`.
   - Inyección en selectores XPath/CSS con captura e inspección de respuestas HTTP del servidor.

3. **Auditoría SAST & Secret Scanning:**
   - Análisis estático de código fuente para detección de vulnerabilidades y credenciales/tokens expuestos.
   - Escaneo de seguridad en dependencias de proyectos.
   - Refactorización de código asistida por IA con visualizador de diferencias (Diff Modal).

4. **🎯 Pruebas de Carga & Resiliencia DoS (Stress Testing):**
   - Simulación de ráfagas de alta concurrencia con control de clientes simultáneos (1-100) y duración del ataque (2s-30s).
   - **Parametrización avanzada:** Soporte completo para métodos HTTP (`GET`, `POST`, `PUT`, `DELETE`), **Cabeceras HTTP Personalizadas (`headersJson`)** y **Payloads JSON Body (`payloadJson`)**[cite: 3].
   - **Métricas e Indicadores Visuales:** Cálculo de RPS sostenidos, latencia promedio, latencia p95 y gráfico proporcional CSS de respuestas HTTP (`2xx`, `429 Rate Limit`, `4xx`, `5xx` y `Timeouts`).
   - Diagnóstico automático de resiliencia y Rate Limiting alimentado por Gemini AI.
   - Feedback visual interactivo con spinner animado y puntero de espera durante la ráfaga[cite: 6].

5. **Configuración de Red & CiberThreat Feed / Radar CVE:**
   - Escaneo de puertos TCP comunes, detección de banners y análisis de superficie expuesta.
   - Radar de vulnerabilidades CVE con análisis explicativo asistido por IA.

6. **📜 Historial Centralizado de Seguridad & Exportación de Reportes:**
   - Historial unificado multitab (`Web`, `SAST` y `Pruebas de Carga`).
   - **Exportación Individual:** Generación de informes en PDF/HTML con la parametrización completa de la prueba (URL, Método, Concurrencia, Duración, Headers, Payloads, Métricas y Diagnóstico IA)[cite: 3, 4].
   - **Exportación Consolidada Global:** Modal de configuración para generar informes ejecutivos globales en formato PDF o HTML combinando múltiples módulos auditados.

---

## 🛠️ Tecnologías Utilizadas

### **Frontend (`/client`)**
- **Core:** React 18, TypeScript, Vite.
- **Estilos:** CSS3 modular con temas oscuros (Cyberpunk/Dark Mode) y componentes interactivos.
- **Servicios:** Cliente API tipado con Fetch API (`api.client.ts`).

### **Backend (`/server`)**
- **Core:** Node.js, Express.js, TypeScript.
- **Pruebas Web & Headless:** Playwright (`chromium`).
- **IA & Diagnóstico:** Google Generative AI SDK (`@google/genai`).
- **Base de Datos:** MySQL con pool de conexiones asíncronas (`mysql2/promise`).
- **Utilidades:** dotenv, cors, uuid.

---

## 📁 Estructura del Proyecto

```text
qa-sec-suite/
│
├── client/                                   # Frontend (React + TypeScript + Vite)
│   ├── public/                               # Favicon e íconos vectoriales
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── assets/                           # Recursos visuales
│       ├── components/                       # Componentes React por dominio
│       │   ├── cve/                          # Radar CVE y resumen IA
│       │   │   ├── cve.types.ts
│       │   │   ├── CveAiSummaryModal.tsx
│       │   │   ├── CveRadarTab.tsx
│       │   │   └── StackFilterBar.tsx
│       │   ├── dashboard/                    # Navegación, formularios e InputInjectionAuditor
│       │   │   ├── dashboard.types.ts
│       │   │   ├── index.ts
│       │   │   ├── InputInjectionAuditor.tsx
│       │   │   ├── NavigationTabs.tsx
│       │   │   ├── ProjectForm.tsx
│       │   │   └── ScanProgressBar.tsx
│       │   ├── history/                      # Tablas de historial por módulo
│       │   │   ├── history.types.ts
│       │   │   ├── HistoryTable.tsx
│       │   │   ├── index.ts
│       │   │   ├── LoadTestHistoryTable.tsx
│       │   │   ├── ReportModal.tsx
│       │   │   └── SastHistoryTable.tsx
│       │   ├── loadTest/                     # Componentes de pruebas de carga
│       │   │   ├── loadTest.types.ts
│       │   │   ├── LoadTestConfigForm.tsx
│       │   │   ├── LoadTestMetricsCard.tsx
│       │   │   └── LoadTestTab.tsx
│       │   ├── network/                      # Métricas, diagnósticos y puertos de red
│       │   │   ├── index.ts
│       │   │   ├── NetworkAiDiagnosis.tsx
│       │   │   ├── NetworkMetrics.tsx
│       │   │   └── NetworkPortsTable.tsx
│       │   ├── report/                       # Modales y exportadores de reportes
│       │   │   ├── AiSummaryBanner.tsx
│       │   │   ├── ConsolidatedReportExportModal.tsx
│       │   │   ├── FindingCard.tsx
│       │   │   ├── FormFindingContent.tsx
│       │   │   ├── index.ts
│       │   │   ├── report.types.ts
│       │   │   ├── ReportExportActions.tsx
│       │   │   └── ReportModals.tsx
│       │   ├── sast/                         # Auditorías SAST, refactorización y hallazgos
│       │   │   ├── CodeSnippetEditor.tsx
│       │   │   ├── sast.types.ts
│       │   │   ├── SastAuditTab.tsx
│       │   │   ├── SastDiffModal.tsx
│       │   │   └── SastFindingsTable.tsx
│       │   ├── suite/                        # Tarjetas de suites de prueba
│       │   │   ├── CreatedSuiteCard.tsx
│       │   │   ├── index.ts
│       │   │   └── suite.types.ts
│       │   ├── AISuiteGenerator.tsx          # Diseñador de Prompts con IA
│       │   ├── InputSuiteGenerator.tsx       # Generador de auditoría de inputs
│       │   ├── NetworkConfigAuditor.tsx      # Auditor de Red
│       │   ├── ReportHistory.tsx             # Historial Centralizado de Reportes
│       │   └── ReportViewer.tsx              # Visor detallado de reportes web
│       ├── services/
│       │   └── api.client.ts                 # Cliente HTTP tipado para comunicación con backend
│       ├── App.css
│       ├── App.tsx                           # Componente raíz
│       ├── index.css                         # Estilos globales y temas
│       └── main.tsx                          # Punto de entrada Vite
│
├── server/                                   # Backend (Node.js + Express + TypeScript)
│   └── src/
│       ├── config/                           # Conexión a MySQL y variables de entorno
│       │   ├── database.ts
│       │   └── env.ts
│       ├── controllers/                      # Controladores REST
│       │   ├── cve/
│       │   ├── history/
│       │   ├── loadTest/                     # Controladores de pruebas de carga e historial
│       │   │   ├── loadTest.controller.ts
│       │   │   ├── loadTest.helpers.ts
│       │   │   └── loadTestHistory.controller.ts
│       │   ├── portScan/
│       │   ├── project/
│       │   ├── report/                       # Exportadores individual y consolidado
│       │   │   ├── consolidatedReport.controller.ts
│       │   │   └── singleReportExport.controller.ts
│       │   ├── sast/
│       │   ├── scanner/
│       │   ├── api.types.ts
│       │   ├── cve.controller.ts
│       │   ├── history.controller.ts
│       │   ├── portScan.controller.ts
│       │   ├── project.controller.ts
│       │   ├── prompts.controller.ts
│       │   ├── reportExport.controller.ts
│       │   ├── sast.controller.ts
│       │   └── scanner.controller.ts
│       ├── core/                             # Motor de ejecución Playwright & Interceptores
│       │   ├── interceptor/
│       │   └── runner/                       # Evaluadores de formularios e inyección
│       ├── modules/                          # Definición de módulos de análisis
│       │   ├── cve/
│       │   ├── loadTest/                     # DTOs y tipos de pruebas de estrés
│       │   ├── report/                       # Tipos de exportación de reportes
│       │   └── sast/
│       ├── routes/                           # Rutas de la API (api.routes.ts)
│       ├── services/                         # Servicios de negocio
│       │   ├── cve/
│       │   ├── findings/
│       │   ├── gemini/                       # Prompts y servicio de Google Gemini AI
│       │   ├── history/
│       │   ├── loadTest/                     # Runner de ráfagas y servicio de historial
│       │   │   ├── loadTestHistory.service.ts
│       │   │   └── loadTestRunner.service.ts
│       │   ├── network/
│       │   ├── report/                       # Formateadores HTML para reportes
│       │   └── sast/
│       └── utils/                            # Utilidades y generadores de ID
│
├── database.sql                              # Esquema de tablas MySQL e inyección inicial
├── package.json                              # Configuración raíz
└── README.md                                 # Documentación técnica
```

⚙️ Configuración e Instalación
1. Prerrequisitos
Node.js: >= 18.x

MySQL Server: >= 8.0

Google Gemini API Key: Cuenta activa en Google AI Studio.

2. Base de Datos
Crea la base de datos MySQL e importa la estructura e inyecciones del archivo database.sql:

mysql -u tu_usuario -p < database.sql

(Nota: El script creará la base de datos qa_sec_db, las tablas relacionales para historial, SAST, pruebas de carga y cargará el catálogo OWASP Top 10 de reglas y cargas útiles).

3. Configuración del Backend (/server)
Dirígete a la carpeta del servidor e instala las dependencias:

cd server
npm install

Instala los navegadores requeridos por Playwright:
npx playwright install chromium

Crea el archivo .env en la raíz de /server:
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=qa_sec_db
GEMINI_API_KEY=

Inicia el servidor en modo desarrollo:
npm run dev

4. Configuración del Frontend (/client)
En una nueva terminal, dirígete a la carpeta del cliente e instala las dependencias:

Bash
cd client
npm install

Inicia el servidor de desarrollo con Vite:

Bash
npm run dev
Abre tu navegador e ingresa a http://localhost:5173.