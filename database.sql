CREATE DATABASE IF NOT EXISTS qa_sec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qa_sec_db;

-- 1. Tabla de Proyectos QA
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_url VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Suites de Prueba Personalizadas (Soporta vinculación directa con input_prompts)
CREATE TABLE IF NOT EXISTS test_suites (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    prompt_input TEXT NULL,
    prompt_id VARCHAR(36) NULL,
    modules_config JSON NOT NULL,
    created_by VARCHAR(50) DEFAULT 'QA_User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Historial de Ejecuciones de Pruebas
CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(36) PRIMARY KEY,
    test_suite_id VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Hallazgos y Vulnerabilidades Detectadas
CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(36) PRIMARY KEY,
    test_run_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') NOT NULL DEFAULT 'INFO',
    title VARCHAR(150) NULL,
    description TEXT NOT NULL,
    recommendation TEXT NULL,
    target_url VARCHAR(2048) NULL,
    evidence TEXT NULL,
    raw_payload LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Tabla para registrar ejecuciones de escaneo de red
CREATE TABLE IF NOT EXISTS port_scans (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NULL,
    target_host VARCHAR(255) NOT NULL,
    scan_type VARCHAR(50) DEFAULT 'QUICK_TOP_100',
    status ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    ai_risk_assessment TEXT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Tabla para almacenar el detalle de los puertos detectados
CREATE TABLE IF NOT EXISTS open_ports (
    id VARCHAR(36) PRIMARY KEY,
    port_scan_id VARCHAR(36) NOT NULL,
    port_number INT NOT NULL,
    protocol VARCHAR(10) DEFAULT 'TCP',
    service_name VARCHAR(50) NOT NULL,
    banner_info TEXT NULL,
    severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') DEFAULT 'INFO',
    ai_mitigation TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (port_scan_id) REFERENCES port_scans(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Plantillas Predefinidas de Prompts Generales
CREATE TABLE IF NOT EXISTS prompt_presets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    prompt_text TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'GENERAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Inserción de Presets Generales
INSERT INTO prompt_presets (title, prompt_text, category) VALUES
('1. Auditoría Inicial y Exposición de Archivos', 'Quiero hacer un análisis completo de seguridad inicial. Realiza una auditoría de encabezados HTTP como CSP, CORS y HSTS, y verifica si existen archivos sensibles o de desarrollo expuestos públicamente como .env, .git o documentación Swagger.', 'RECOMMENDED'),
('2. Enfoque en Seguridad de Frontend y Fuga de Datos', 'Analiza la aplicación buscando fugas de información en el código cliente. Necesito verificar si hay comentarios con notas de desarrollo, credenciales hardcodeadas, tokens de API o claves expuestas en las respuestas HTTP e inspección de JavaScript.', 'FRONTEND'),
('3. Suite para Entorno de Staging / QA Pre-Despliegue', 'Configura una suite de prueba estricta para antes de salir a producción. Revisa que el servidor no tenga orígenes de CORS permisivos con asterisco, que no exponga archivos de configuración y que la transmisión tenga los encabezados de protección activos.', 'STAGING'),
('4. Verificación de Rutas Críticas y Headers', 'Necesito verificar si la aplicación expone rutas públicas críticas y revisar los headers de seguridad del servidor principal.', 'CUSTOM'),
('5. Auditoría Estricta de CORS y Orígenes Cruzados', 'Audita a fondo la configuración de Cross-Origin Resource Sharing (CORS). Verifica si el servidor acepta cualquier origen mediante comodines (*), valida la presencia de Access-Control-Allow-Credentials en orígenes no confiables y evalúa riesgos de suplantación de dominio.', 'CORS_AUDIT'),
('6. Detección de Credenciales y Keys en Bundles de JavaScript', 'Inspecciona minuciosamente todos los archivos .js descargables, sourcemaps y assets compilados del cliente. Busca la presencia de API keys de Firebase, credenciales de AWS/GCP, tokens JWT hardcodeados y notas internas de desarrollo.', 'JS_LEAKAGE'),
('7. Verificación de Protección contra Framing (Clickjacking)', 'Analiza la vulnerabilidad de la aplicación ante ataques de Clickjacking. Evalúa las directivas X-Frame-Options (DENY/SAMEORIGIN) y la regla frame-ancestors en la política Content-Security-Policy (CSP).', 'CLICKJACKING'),
('8. Auditoría de Seguridad en Galletas (Cookies & Session)', 'Evalúa los atributos de seguridad de todas las cookies emitidas por el servidor en la sesión inicial. Verifica que cuenten activamente con los flags Secure, HttpOnly y la directiva SameSite configurada en Strict o Lax.', 'COOKIES_SESSION'),
('9. Mapeo y Exposición de Paneles de Administración', 'Escanea y verifica la exposición de endpoints sensibles de administración o métricas como /admin, /dashboard, /actuator/health, /kibana o interfaces de gestión que no deban estar indexadas públicamente.', 'ADMIN_EXPOSURE'),
('10. Auditoría de TLS/SSL y Redirecciones de Seguridad', 'Verifica que todo el tráfico HTTP no cifrado se redirija forzosamente a HTTPS (301/302). Evalúa la validez de las cabeceras Strict-Transport-Security (HSTS) incluyendo la directiva includeSubDomains y preload.', 'TLS_HSTS'),
('11. Detección de Respuestas Verbosas y Trazas de Error (Stack Traces)', 'Fuerza respuestas de error provocando solicitudes malformadas para verificar si el servidor expone información técnica del stack tecnológico, trazas de depuración de frameworks (Node/Express, Spring, Laravel) o versiones exactas.', 'ERROR_LEAKAGE'),
('12. Evaluación de Protección contra CSRF y Validaciones de Métodos HTTP', 'Analiza el comportamiento de la aplicación ante peticiones cross-site. Verifica el manejo de encabezados personalizados en métodos modificadores (POST, PUT, DELETE) y la consistencia en el control de orígenes.', 'CSRF_PROTECTION'),
('13. Análisis de Metadatos y Archivos de Indexación (Robots & Sitemap)', 'Audita el contenido de robots.txt y sitemap.xml en busca de rutas privadas o carpetas sensibles omitidas explícitamente pero reveladas a atacantes mediante motores de búsqueda.', 'RECON_METADATA'),
('14. Escaneo de Archivos Temporales y Respaldos de Servidor Web', 'Busca la presencia accidental de archivos de respaldo o copias de seguridad de código creadas por editores o despliegues, como .bak, .old, .zip, config.php.swp o database.dump.', 'BACKUP_FILES'),
('15. Validación de Políticas de Tipos de Contenido (MIME-Sniffing & XSS)', 'Inspecciona las respuestas HTTP para garantizar la presencia de X-Content-Type-Options: nosniff, y audita las reglas de carga de scripts e imágenes definidas en la política de seguridad de contenidos (CSP).', 'XSS_CSP'),
('16. Auditoría de Sanitización de Inputs y Resiliencia SQL', 'Evalúa cómo responden los campos de entrada de los formularios frente a datos no estándar y valida las políticas de sanitización y parametrización defensiva.', 'INPUT_SECURITY')
ON DUPLICATE KEY UPDATE title=VALUES(title), prompt_text=VALUES(prompt_text);

-- 8. Tabla para almacenar las Reglas/Prompts dinámicos del Módulo de Inputs
CREATE TABLE IF NOT EXISTS input_prompts (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    priority INT DEFAULT 1,
    prompt_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. Tabla para almacenar los Vectores / Payloads asociados a cada Regla
CREATE TABLE IF NOT EXISTS input_payloads (
    id VARCHAR(36) PRIMARY KEY,
    prompt_id VARCHAR(36) NULL,
    payload_value VARCHAR(255) NOT NULL,
    description VARCHAR(255) NULL,
    FOREIGN KEY (prompt_id) REFERENCES input_prompts(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Carga Masiva de Prompts OWASP Top 10 con sus Prioridades Exactas
INSERT INTO input_prompts (id, name, priority, prompt_text) VALUES 
('p-auth-01', '🔑 OWASP A07: Bypass de Lógica de Validación y Nulos', 14, 'Envía valores null, undefined, true o strings vacíos para verificar si la lógica de negocio procesa peticiones incompletas sin autenticar.'),
('p-cmdi-01', '💻 OWASP A03: Inyección de Comandos de Sistema Operativo (Command Injection)', 1, 'Inyecta separadores de shell (;, |, &&, `) con comandos de lectura del sistema como whoami, id o dir para verificar el aislamiento de la capa de sistema.'),
('p-format-01', '🔤 OWASP A03: Formato de Cadenas Extremas y Caracteres Nulos (Null Byte)', 16, 'Inyecta caracteres nulos (%00, \0) y cadenas masivas de longitud extrema para evaluar la estabilidad del búfer y validación de expresiones regulares.'),
('p-header-01', '🚀 OWASP A03: HTTP Response Splitting y CR-LF Injection', 12, 'Inyecta secuencias de salto de línea (\r\n / %0d%0a) para evaluar si el servidor permite la manipulación de cabeceras HTTP de respuesta.'),
('p-json-01', '📦 OWASP A08: Inyección en Cargas Utiles JSON / Schema Pollution', 13, 'Modifica la estructura de payloads JSON agregando claves duplicadas o arreglos anidados para evaluar si la validación del esquema es estricta.'),
('p-logic-01', '⚖️ OWASP A04: Lógica de Negocio y Precios Negativos', 18, 'Inyecta valores negativos (-100, -1) en campos numéricos transaccionales para asegurar que el sistema no realiza operaciones con importes inválidos.'),
('p-nosql-01', '🍃 OWASP A03: Inyección NoSQL (MongoDB / Document Databases)', 5, 'Audita operadores NoSQL ($ne, $gt,$where) en endpoints que procesen JSON o parámetros codificados para evitar la elusión de lógica de negocio.'),
('p-path-01', '📂 OWASP A01: Local File Inclusion (LFI) / Path Traversal', 6, 'Efectúa intentos de navegación en el sistema de archivos (../../../../etc/passwd, c:\boot.ini) para verificar que el servidor restringe el acceso a directorios.'),
('p-redirect-01', '🔀 OWASP A01: Redirección Abierta (Open Redirect)', 17, 'Proporciona URLs externas en parámetros de redirección/retorno para asegurar que el backend valida los dominios de destino autorizados.'),
('p-sqli-01', '💉 OWASP A03: Inyección SQL (SQLi) Básica y Basada en Errores', 2, 'Genera vectores de inyección SQL con caracteres de ruptura (\', ", --, /*) para detectar si la base de datos expone errores de sintaxis SQL o comportamientos anómalos.'),
('p-sqli-02', '⌛ OWASP A03: Inyección SQL Ciega basada en Tiempo (Time-Based Blind SQLi)', 3, 'Audita mediante retrasos de tiempo (SLEEP, WAITFOR DELAY) si el backend ejecuta consultas SQL no parametrizadas de forma asíncrona.'),
('p-sqli-03', '🔓 OWASP A03: Inyección SQL de Autenticación / Bypass de Login', 4, 'Evalúa si los inputs permiten alterar la lógica booleana de autenticación mediante or OR 1=1 o administradores por defecto.'),
('p-ssrf-01', '🌐 OWASP A10: Server-Side Request Forgery (SSRF) en Inputs de URL', 7, 'Proporciona esquemas de red internos (http://127.0.0.1, http://169.254.169.254) para comprobar si el servidor realiza peticiones no autorizadas en su intranet.'),
('p-ssti-01', '🎨 OWASP A03: Server-Side Template Injection (SSTI)', 8, 'Evalúa motores de plantillas (Jinja2, Twig, Freemarker, Handlebars) inyectando expresiones matemáticas {{7*7}} o ${7*7} para detectar ejecución remota.'),
('p-type-01', '🔢 OWASP A03: Tipo de Datos y Desbordamiento de Enteros (Integer Overflow)', 15, 'Inyecta valores numéricos fuera de límites (2147483648, -1, NaN, Infinity) para detectar fallos de tipado o desbordamientos en la lógica de negocio.'),
('p-xss-01', '☣️ OWASP A03: Cross-Site Scripting (XSS) Reflejado Básico', 10, 'Injecta vectores con etiquetas HTML y eventos JavaScript (<script>, onload, onerror) para verificar la desinfección en la renderización del cliente.'),
('p-xss-02', '🛡️ OWASP A03: XSS con Evasión de Filtros / WAF Bypassing', 11, 'Audita la resistencia frente a payloads XSS con codificación HTML/Hexadecimal, etiquetas svg y vectores sin comillas ni espacios.'),
('p-xxe-01', '📄 OWASP A05: XML External Entity (XXE) Injection', 9, 'Envía estructuras XML con entidades externas declaradas (!ENTITY) para comprobar si el procesador XML intenta resolver recursos remotos o del sistema.')
ON DUPLICATE KEY UPDATE name=VALUES(name), priority=VALUES(priority), prompt_text=VALUES(prompt_text);

-- Carga Masiva de Payloads Reales Asociados (Ordenados conforme a las prioridades)
INSERT INTO input_payloads (id, prompt_id, payload_value, description) VALUES 
-- Command Injection
('pay-cmdi-01', 'p-cmdi-01', '; whoami', 'Secuenciador de comandos Unix con punto y coma'),
('pay-cmdi-02', 'p-cmdi-01', '& dir', 'Secuenciador de comandos Windows'),
('pay-cmdi-03', 'p-cmdi-01', '| id', 'Encadenamiento por tubería Pipe'),
('pay-cmdi-04', 'p-cmdi-01', '`id`', 'Sustitución de comandos Unix'),

-- SQLi
('pay-sqli-01', 'p-sqli-01', 'test_qa\' OR \'1\'=\'1', 'Inyección booleana clásica con comilla simple'),
('pay-sqli-02', 'p-sqli-01', 'test_qa" OR "1"="1', 'Inyección booleana con comilla doble'),
('pay-sqli-03', 'p-sqli-01', 'test_qa\'; SELECT SLEEP(5);--', 'Inyección acumulada con retardo de tiempo PostgreSQL/MySQL'),
('pay-sqli-04', 'p-sqli-01', '1 UNION SELECT NULL, @@version, NULL--', 'Extracción de versión de MySQL via UNION'),

-- SQLi Time-Based
('pay-sqli-time-01', 'p-sqli-02', '1\' AND (SELECT 1 FROM (SELECT(SLEEP(4)))a)--', 'Time-based blind delay en MySQL'),
('pay-sqli-time-02', 'p-sqli-02', '1\'; WAITFOR DELAY \'0:0:4\'--', 'Time-based blind delay en Microsoft SQL Server'),

-- SQLi Auth Bypass
('pay-sqli-auth-01', 'p-sqli-03', 'admin\'--', 'Autenticación como admin comentando la clave'),
('pay-sqli-auth-02', 'p-sqli-03', '\' OR 1=1--', 'Bypass de autenticación genérico'),

-- NoSQL Injection
('pay-nosql-01', 'p-nosql-01', '{"$gt": ""}', 'Operador mayor que NoSQL para elusión de login'),
('pay-nosql-02', 'p-nosql-01', '{"$ne": null}', 'Operador no igual a nulo NoSQL'),

-- Path Traversal / LFI
('pay-path-01', 'p-path-01', '../../../../etc/passwd', 'Navegación LFI relativa a archivo de usuarios Unix'),
('pay-path-02', 'p-path-01', '..\\..\\..\\..\\windows\\win.ini', 'Navegación Path Traversal Windows'),
('pay-path-03', 'p-path-01', '%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd', 'Path Traversal codificado en URL'),

-- SSRF
('pay-ssrf-01', 'p-ssrf-01', 'http://127.0.0.1:8080', 'Intento de SSRF a servicio loopback interno'),
('pay-ssrf-02', 'p-ssrf-01', 'http://169.254.169.254/latest/meta-data/', 'Intento de extracción de metadatos Cloud AWS'),

-- SSTI
('pay-ssti-01', 'p-ssti-01', '{{7*7}}', 'Inyección de plantilla Jinja2 / Twig'),
('pay-ssti-02', 'p-ssti-01', '${7*7}', 'Inyección de plantilla Spring / Handlebars'),
('pay-ssti-03', 'p-ssti-01', '<%= 7 * 7 %>', 'Inyección de plantilla ERB / EJS'),

-- XXE
('pay-xxe-01', 'p-xxe-01', '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>', 'Payload XXE para lectura de archivo en servidor'),

-- XSS Reflejado
('pay-xss-01', 'p-xss-01', '<script>alert("QA_SEC_TEST")</script>', 'Inyección de script directo'),
('pay-xss-02', 'p-xss-01', '<img src=x onerror=alert("XSS_QA")>', 'Inyección de imagen con evento de error'),
('pay-xss-03', 'p-xss-01', '<svg onload=alert(1)>', 'Inyección SVG con evento onload'),

-- XSS WAF Bypass
('pay-xss-waf-01', 'p-xss-02', '<body onload=alert(1)>', 'Vector body sin comillas'),
('pay-xss-waf-02', 'p-xss-02', 'javascript:alert(document.cookie)', 'Esquema de URI pseudo-JavaScript'),
('pay-xss-waf-03', 'p-xss-02', '<iframe src="javascript:alert(1)"></iframe>', 'Iframe con ejecución de Javascript'),

-- HTTP Header Splitting
('pay-header-01', 'p-header-01', 'test%0d%0aSet-Cookie:CRLF_INJECTION=TRUE', 'Inyección de salto de línea CRLF en cabeceras'),

-- Overflow / Integers
('pay-type-01', 'p-type-01', '2147483648', 'Integer de 32 bits fuera de rango positivo'),
('pay-type-02', 'p-type-01', '-2147483649', 'Integer de 32 bits fuera de rango negativo'),

-- Format / Null Byte
('pay-format-01', 'p-format-01', 'test_qa%00.png', 'Inyección de carácter nulo para evasión de extensión'),

-- Logic / Precios
('pay-logic-01', 'p-logic-01', '-100', 'Monto numérico negativo para pruebas transaccionales')
ON DUPLICATE KEY UPDATE payload_value=VALUES(payload_value), description=VALUES(description);

-- Tabla de Caché y Persistencia de Análisis CVE por Gemini AI
CREATE TABLE IF NOT EXISTS cve_ai_cache (
    cve_id VARCHAR(50) PRIMARY KEY,
    summary_es TEXT NOT NULL,
    impact_level TEXT NOT NULL,
    mitigation_steps JSON NOT NULL,
    urgency ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW') NOT NULL DEFAULT 'MEDIUM',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS sast_audit_history (
    id VARCHAR(64) PRIMARY KEY,
    file_name VARCHAR(255) DEFAULT 'snippet.txt',
    file_type VARCHAR(50) NOT NULL,
    health_score INT NOT NULL,
    total_findings INT NOT NULL,
    findings_json LONGTEXT NOT NULL,
    remediated_code LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS load_test_history (
    id VARCHAR(64) PRIMARY KEY,
    target_url VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    concurrency INT NOT NULL,
    duration_seconds INT NOT NULL,
    total_requests INT NOT NULL,
    rps INT NOT NULL,
    avg_latency_ms INT NOT NULL,
    p95_latency_ms INT NOT NULL,
    rate_limit_protection VARCHAR(50) NOT NULL,
    metrics_json LONGTEXT NOT NULL,
    ai_diagnosis_json LONGTEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE load_test_history 
ADD COLUMN payload_json LONGTEXT NULL AFTER duration_seconds;

ALTER TABLE load_test_history 
ADD COLUMN headers_json LONGTEXT NULL AFTER payload_json;

CREATE TABLE IF NOT EXISTS dast_history (
    id VARCHAR(64) PRIMARY KEY,
    target_base_url VARCHAR(255) NOT NULL,
    total_endpoints_tested INT NOT NULL DEFAULT 0,
    findings_json LONGTEXT NULL,
    ai_summary_json LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sca_history (
    id VARCHAR(64) PRIMARY KEY,
    manifest_type VARCHAR(50) NULL,
    total_deps_audited INT NOT NULL DEFAULT 0,
    vulnerabilities_json LONGTEXT NULL,
    git_secrets_json LONGTEXT NULL,
    ai_summary_json LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS easm_history (
    id VARCHAR(36) PRIMARY KEY,
    target_domain VARCHAR(255) NOT NULL,
    dns_records_json JSON NULL,
    subdomains_json JSON NULL,
    waf_tech_json JSON NULL,
    ssl_details_json JSON NULL,
    ai_summary_json JSON NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS redteam_history (
    id VARCHAR(64) PRIMARY KEY,
    target_url VARCHAR(255) NOT NULL,
    jwt_token TEXT NULL,
    jwt_findings_json LONGTEXT,
    cors_findings_json LONGTEXT,
    phishing_count INT DEFAULT 0,
    ai_summary_json LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS emailsec_history (
    id VARCHAR(64) PRIMARY KEY,
    target_domain VARCHAR(255) NULL,
    target_ip VARCHAR(64) NULL,
    spf_json LONGTEXT NULL,
    dmarc_json LONGTEXT NULL,
    dkim_json LONGTEXT NULL,
    rbl_json LONGTEXT NULL,
    headers_json LONGTEXT NULL,
    ai_summary_json LONGTEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- 1. Tabla de Roles del Sistema
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY,
    name ENUM('ADMIN', 'AUDITOR', 'VIEWER') NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO roles (id, name, description) VALUES
('role-admin-01', 'ADMIN', 'Acceso total: gestión de usuarios, roles y configuración del sistema.'),
('role-auditor-02', 'AUDITOR', 'Ejecución de auditorías, escaneos y generación de informes.'),
('role-viewer-03', 'VIEWER', 'Acceso de solo lectura a historiales e informes ejecutivos.')
ON DUPLICATE KEY UPDATE description=VALUES(description);

-- 2. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL UNIQUE,
    full_name VARCHAR(100) NULL,
    role_id VARCHAR(36) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Tabla de Códigos OTP Transaccionales
CREATE TABLE IF NOT EXISTS auth_otps (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(191) NOT NULL,
    otp_code VARCHAR(64) NOT NULL, -- Hash SHA-256 del código para evitar exposición directa en DB
    attempts_left TINYINT NOT NULL DEFAULT 3,
    expires_at DATETIME NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email_lookup (email, consumed, expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Registro de Auditoría de Acciones Administrativas (Compliance & Traceability)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NULL,
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  user_email VARCHAR(255) NOT NULL,
  action ENUM('ROLE_CHANGE', 'USER_SUSPEND', 'TEST_RUN', 'REPORT_EXPORT') NOT NULL,
  module VARCHAR(64) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Ejecutar en la base de datos qa_sec_db
ALTER TABLE users 
ADD COLUMN allowed_modules JSON NOT NULL 
DEFAULT ('["REPORTS"]') 
AFTER role_id;

-- Asegurar que el usuario administrador tenga acceso a la suite completa
UPDATE users u
JOIN roles r ON u.role_id = r.id
SET u.allowed_modules = JSON_ARRAY(
    'SAST', 'DAST', 'SCA', 'EASM', 'REDTEAM', 
    'EMAILSEC', 'LOADTEST', 'NETWORK', 'COMPLIANCE', 
    'REPORTS', 'ADMIN'
)
WHERE r.name = 'ADMIN';


USE qa_sec_db;

-- 1. Agregar las columnas requeridas por el servicio de auditoría
ALTER TABLE audit_logs 
ADD COLUMN user_email VARCHAR(255) NOT NULL DEFAULT 'system@qa-sec.local' AFTER user_id,
ADD COLUMN module VARCHAR(64) NOT NULL DEFAULT 'SYSTEM' AFTER action,
ADD COLUMN details TEXT NULL AFTER module;

-- 2. Modificar action para soportar los tipos de evento requeridos
ALTER TABLE audit_logs 
MODIFY COLUMN action VARCHAR(100) NOT NULL;


USE qa_sec_db;

DROP TABLE IF EXISTS audit_logs;

CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(64) NULL,
  user_email VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL,
  module VARCHAR(64) NOT NULL,
  details TEXT NOT NULL,
  ip_address VARCHAR(45) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;