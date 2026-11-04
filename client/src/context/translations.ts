export type Language = 'es' | 'en';

export const translations = {
  es: {
    // Header
    headerTitlePrefix: 'SUITE DE',
    headerTitleHighlight: 'CONTROL DE CALIDAD Y SEGURIDAD',
    headerSubtitle: 'PLATAFORMA DE AUDITORÍA Y DEVSECOPS IMPULSADA POR IA',
    onlineAuditors: (count: number) => `${count} Auditor(es) en Línea`,
    geminiActive: 'Gemini v3 - Activo',
    securedBadge: 'Protegido',
    adminConsoleBtn: 'ADMIN',
    adminConsoleTitle: 'Ir a Consola RBAC',
    logoutBtn: 'Salir',
    loginBtn: '🔑 Iniciar Sesión',
    goHomeTitle: 'Ir a Inicio',

    // Scanner & Inputs
    suiteAiConfigured: 'Suite configurada por Gemini AI y lista para ejecutar.',
    suiteAiInputsConfigured: 'Suite de prueba de inputs configurada por Gemini AI.',
    projectCreatedAlert: 'Proyecto inicializado correctamente en MySQL.',
    suiteRequiredAlert: 'Debes generar o seleccionar una suite primero.',
    inputsRequiredAlert: 'Por favor agrega al menos un campo/localizador (ID, Name, XPath o CSS) para auditar.',
    scanErrorAlert: (err: string) => `Error durante la ejecución del escáner: ${err}`,
    backendConnErrorAlert: (err: string) => `Error de conexión con el backend: ${err}`,

    // Botones de ejecución
    btnConfiguringSuite: '⏳ Espere, configurando suite con Gemini AI...',
    btnScanningProgress: 'Escaneando en progreso...',
    btnAuditingInputsProgress: 'Auditando Inputs...',
    btnRunScanner: '🚀 Ejecutar Pruebas de Seguridad',
    btnRunInputAudit: '🚀 Ejecutar Auditoría de Inputs',

    // Pasos de escaneo
    statusStartingHeadless: 'Iniciando navegador headless (Playwright)...',
    statusStartingInputs: 'Iniciando navegador e interactuando con los campos objetivo...',
    statusGeneratingReport: 'Generando reporte técnico...',
    statusGeneratingInputReport: 'Generando reporte técnico de sanitización...',
    statusLocatingDom: 'Localizando campos objetivo en el DOM con Playwright...',
    statusInterceptingNetwork: 'Interceptando tráfico de red y encabezados HTTP...',
    statusAnalyzingSanitization: 'Analizando tipos de datos, atributos de sanitización y respuestas...',
    statusScanningSensitives: 'Escaneando archivos sensibles y configuraciones...',
    statusGeminiDefensive: 'Analizando respuestas y ejecutando análisis defensivo con Gemini...',

    // HomeTab (Hero & Stats)
    homeSystemOperational: 'SISTEMA OPERACIONAL • TODOS LOS MÓDULOS LISTOS',
    homeHeroTitle: 'Motor DevSecOps de QA-Sec Suite',
    homeHeroDesc:
      'Plataforma modular de auditoría ofensiva y defensiva impulsada por Gemini AI. Evalúa vulnerabilidades en tiempo real, verifica el cumplimiento normativo y asegura el ciclo de vida del software.',
    homeBtnStartWebAudit: 'Iniciar Auditoría Web',
    homeBtnViewCompliance: 'Ver Compliance Radar',
    homeStatModulesLabel: 'MÓDULOS DE AUDITORÍA',
    homeStatModulesValue: '12 Activos',
    homeStatAiLabel: 'MOTOR DE IA',
    homeStatAiValue: 'Gemini AI v3.x',
    homeStatCicdLabel: 'INTEGRACIÓN CI/CD',
    homeStatCicdValue: 'qa-sec-cli',
    homeStatStandardsLabel: 'MARCOS NORMATIVOS',
    homeStatStandardsValue: 'OWASP - ISO - NIST',
    homeModulesSectionTitle: 'Módulos de Auditoría & Análisis Especial',
    homeOpenModuleBtn: 'Abrir Módulo →',

    // Tarjetas de módulos
    modules: {
      scanner: {
        title: 'Escáner & Diseñador IA',
        badge: 'Web App Security',
        desc: 'Fuzzing de parámetros web y generación de suites con IA.',
      },
      injection: {
        title: 'Inyección & Inputs Sec',
        badge: 'Input Security',
        desc: 'Auditoría defensiva de sanitización y bypass en formularios.',
      },
      network: {
        title: 'Configuración de Red',
        badge: 'Infrastructure',
        desc: 'Análisis de puertos TCP expuestos y superficie de perímetro.',
      },
      cve: {
        title: 'CyberThreat Feed & CVE Radar',
        badge: 'Threat Intel',
        desc: 'Monitoreo NVD/CVE en tiempo real y diagnóstico IA.',
      },
      sast: {
        title: 'Auditoría SAST & Secret Scanning',
        badge: 'Code Security',
        desc: 'Análisis estático de código fuente y fuga de credenciales.',
      },
      loadTest: {
        title: 'Pruebas de Carga & DoS',
        badge: 'Resilience',
        desc: 'Simulación de estrés masivo y validación de Rate Limiting.',
      },
      dast: {
        title: 'DAST & OpenAPI Fuzzer',
        badge: 'API Security',
        desc: 'Pruebas dinámicas en APIs (BOLA/IDOR e inyecciones HTTP).',
      },
      sca: {
        title: 'SCA & Supply Chain Sec',
        badge: 'Supply Chain',
        desc: 'Auditoría de librerías vulnerables e historial de commits Git.',
      },
      easm: {
        title: 'EASM & Recon OSINT',
        badge: 'Reconnaissance',
        desc: 'Descubrimiento de subdominios, certificados SSL y WAF.',
      },
      redteam: {
        title: 'Red Team & Explotación',
        badge: 'Offensive Security',
        desc: 'Simulador de firma JWT, bypass CORS y phishing.',
      },
      emailsec: {
        title: 'Email Sec & OSINT',
        badge: 'Email Security',
        desc: 'Inspección de registros SPF/DMARC, RBL y forense .eml.',
      },
      compliance: {
        title: 'Compliance Radar',
        badge: 'Governance',
        desc: 'Mapeo contra OWASP Top 10, ISO 27001 y NIST SP 800-53.',
      },
    },
  },
  en: {
    // Header
    headerTitlePrefix: 'QUALITY & SECURITY',
    headerTitleHighlight: 'ASSURANCE SUITE',
    headerSubtitle: 'AI-POWERED DEVSECOPS & AUDIT PLATFORM',
    onlineAuditors: (count: number) => `${count} Auditor(s) Online`,
    geminiActive: 'Gemini v3 - Active',
    securedBadge: 'Secured',
    adminConsoleBtn: 'ADMIN',
    adminConsoleTitle: 'Go to RBAC Console',
    logoutBtn: 'Logout',
    loginBtn: '🔑 Sign In',
    goHomeTitle: 'Go to Home',

    // Scanner & Inputs
    suiteAiConfigured: 'Suite configured by Gemini AI and ready to run.',
    suiteAiInputsConfigured: 'Input test suite configured by Gemini AI.',
    projectCreatedAlert: 'Project initialized successfully in MySQL.',
    suiteRequiredAlert: 'You must generate or select a suite first.',
    inputsRequiredAlert: 'Please add at least one field/locator (ID, Name, XPath, or CSS) to audit.',
    scanErrorAlert: (err: string) => `Error during scanner execution: ${err}`,
    backendConnErrorAlert: (err: string) => `Backend connection error: ${err}`,

    // Botones de ejecución
    btnConfiguringSuite: '⏳ Please wait, configuring suite with Gemini AI...',
    btnScanningProgress: 'Scanning in progress...',
    btnAuditingInputsProgress: 'Auditing Inputs...',
    btnRunScanner: '🚀 Run Security Tests',
    btnRunInputAudit: '🚀 Run Input Audit',

    // Pasos de escaneo
    statusStartingHeadless: 'Launching headless browser (Playwright)...',
    statusStartingInputs: 'Launching browser and interacting with target fields...',
    statusGeneratingReport: 'Generating technical report...',
    statusGeneratingInputReport: 'Generating sanitization technical report...',
    statusLocatingDom: 'Locating target elements in DOM using Playwright...',
    statusInterceptingNetwork: 'Intercepting network traffic and HTTP headers...',
    statusAnalyzingSanitization: 'Analyzing data types, sanitization attributes, and responses...',
    statusScanningSensitives: 'Scanning for sensitive files and exposed configurations...',
    statusGeminiDefensive: 'Evaluating responses and performing defensive analysis with Gemini...',

    // HomeTab (Hero & Stats)
    homeSystemOperational: 'SYSTEM OPERATIONAL • ALL MODULES READY',
    homeHeroTitle: 'QA-Sec Suite DevSecOps Engine',
    homeHeroDesc:
      'Modular offensive and defensive security platform powered by Gemini AI. Evaluates vulnerabilities in real time, verifies compliance standards, and hardens your software lifecycle.',
    homeBtnStartWebAudit: 'Start Web Audit',
    homeBtnViewCompliance: 'View Compliance Radar',
    homeStatModulesLabel: 'AUDIT MODULES',
    homeStatModulesValue: '12 Active',
    homeStatAiLabel: 'AI ENGINE',
    homeStatAiValue: 'Gemini AI v3.x',
    homeStatCicdLabel: 'CI/CD INTEGRATION',
    homeStatCicdValue: 'qa-sec-cli',
    homeStatStandardsLabel: 'COMPLIANCE BENCHMARKS',
    homeStatStandardsValue: 'OWASP - ISO - NIST',
    homeModulesSectionTitle: 'Audit & Deep Analysis Modules',
    homeOpenModuleBtn: 'Open Module →',

    // Tarjetas de módulos
    modules: {
      scanner: {
        title: 'Scanner & AI Designer',
        badge: 'Web App Security',
        desc: 'Web parameter fuzzing and AI-assisted test suite generation.',
      },
      injection: {
        title: 'Injection & Inputs Sec',
        badge: 'Input Security',
        desc: 'Defensive sanitization audit and form bypass validation.',
      },
      network: {
        title: 'Network Configuration',
        badge: 'Infrastructure',
        desc: 'Exposed TCP port analysis and perimeter perimeter surface scan.',
      },
      cve: {
        title: 'CyberThreat Feed & CVE Radar',
        badge: 'Threat Intel',
        desc: 'Real-time NVD/CVE intelligence feeds and AI diagnostics.',
      },
      sast: {
        title: 'SAST Audit & Secret Scanning',
        badge: 'Code Security',
        desc: 'Static source code analysis and credential leak detection.',
      },
      loadTest: {
        title: 'Load Testing & DoS Audit',
        badge: 'Resilience',
        desc: 'High-concurrency stress testing and rate-limit enforcement.',
      },
      dast: {
        title: 'DAST & OpenAPI Fuzzer',
        badge: 'API Security',
        desc: 'Dynamic API security testing (BOLA/IDOR & HTTP injections).',
      },
      sca: {
        title: 'SCA & Supply Chain Sec',
        badge: 'Supply Chain',
        desc: 'Vulnerable dependency auditing and Git commit history scans.',
      },
      easm: {
        title: 'EASM & Recon OSINT',
        badge: 'Reconnaissance',
        desc: 'Subdomain discovery, SSL inspection, and WAF fingerprinting.',
      },
      redteam: {
        title: 'Red Team & Exploitation',
        badge: 'Offensive Security',
        desc: 'JWT forgery testing, CORS exploitation, and phishing simulation.',
      },
      emailsec: {
        title: 'Email Sec & OSINT',
        badge: 'Email Security',
        desc: 'SPF/DMARC DNS inspection, RBL checks, and .eml forensics.',
      },
      compliance: {
        title: 'Compliance Radar',
        badge: 'Governance',
        desc: 'Controls mapping against OWASP Top 10, ISO 27001, and NIST 800-53.',
      },
    },
  },
};

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.es;
}