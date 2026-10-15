CREATE DATABASE IF NOT EXISTS qa_sec_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE qa_sec_db;

-- Tabla de Proyectos QA
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    target_url VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Suites de Prueba Personalizadas (Generadas manualmente o por Gemini AI)
CREATE TABLE IF NOT EXISTS test_suites (
    id VARCHAR(36) PRIMARY KEY,
    project_id VARCHAR(36) NOT NULL,
    name VARCHAR(100) NOT NULL,
    modules_config JSON NOT NULL,
    created_by VARCHAR(50) DEFAULT 'QA_User',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Historial de Ejecuciones de Pruebas
CREATE TABLE IF NOT EXISTS test_runs (
    id VARCHAR(36) PRIMARY KEY,
    test_suite_id VARCHAR(36) NOT NULL,
    status ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED') DEFAULT 'PENDING',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP NULL,
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Hallazgos y Vulnerabilidades Detectadas
CREATE TABLE IF NOT EXISTS findings (
    id VARCHAR(36) PRIMARY KEY,
    test_run_id VARCHAR(36) NOT NULL,
    module_name VARCHAR(50) NOT NULL,
    severity ENUM('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO') NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    raw_payload JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_run_id) REFERENCES test_runs(id) ON DELETE CASCADE
) ENGINE=InnoDB;

ALTER TABLE findings ADD COLUMN target_url VARCHAR(2048) NULL AFTER recommendation;
ALTER TABLE findings ADD COLUMN evidence TEXT NULL AFTER target_url;

ALTER TABLE findings MODIFY COLUMN raw_payload LONGTEXT NULL;

ALTER TABLE test_suites 
ADD COLUMN prompt_input TEXT NULL AFTER name;


-- Tabla para registrar ejecuciones de escaneo de red
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

-- Tabla para almacenar el detalle de los puertos detectados
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


CREATE TABLE IF NOT EXISTS prompt_presets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  prompt_text TEXT NOT NULL,
  category VARCHAR(50) DEFAULT 'GENERAL',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO prompt_presets (title, prompt_text, category) VALUES
('1. Auditoría Inicial y Exposición de Archivos', 'Quiero hacer un análisis completo de seguridad inicial. Realiza una auditoría de encabezados HTTP como CSP, CORS y HSTS, y verifica si existen archivos sensibles o de desarrollo expuestos públicamente como .env, .git o documentación Swagger.', 'RECOMMENDED'),
('2. Enfoque en Seguridad de Frontend y Fuga de Datos', 'Analiza la aplicación buscando fugas de información en el código cliente. Necesito verificar si hay comentarios con notas de desarrollo, credenciales hardcodeadas, tokens de API o claves expuestas en las respuestas HTTP e inspección de JavaScript.', 'FRONTEND'),
('3. Suite para Entorno de Staging / QA Pre-Despliegue', 'Configura una suite de prueba estricta para antes de salir a producción. Revisa que el servidor no tenga orígenes de CORS permisivos con asterisco, que no exponga archivos de configuración y que la transmisión tenga los encabezados de protección activos.', 'STAGING'),
('4. Verificación de Rutas Críticas y Headers', 'Necesito verificar si la aplicación expone rutas públicas críticas y revisar los headers de seguridad del servidor principal.', 'CUSTOM');
('5. Auditoría Estricta de CORS y Orígenes Cruzados', 
 'Audita a fondo la configuración de Cross-Origin Resource Sharing (CORS). Verifica si el servidor acepta cualquier origen mediante comodines (*), valida la presencia de Access-Control-Allow-Credentials en orígenes no confiables y evalúa riesgos de suplantación de dominio.', 
 'CORS_AUDIT'),
('6. Detección de Credenciales y Keys en Bundles de JavaScript', 
 'Inspecciona minuciosamente todos los archivos .js descargables, sourcemaps y assets compilados del cliente. Busca la presencia de API keys de Firebase, credenciales de AWS/GCP, tokens JWT hardcodeados y notas internas de desarrollo.', 
 'JS_LEAKAGE'),
('7. Verificación de Protección contra Framing (Clickjacking)', 
 'Analiza la vulnerabilidad de la aplicación ante ataques de Clickjacking. Evalúa las directivas X-Frame-Options (DENY/SAMEORIGIN) y la regla frame-ancestors en la política Content-Security-Policy (CSP).', 
 'CLICKJACKING'),
('8. Auditoría de Seguridad en Galletas (Cookies & Session)', 
 'Evalúa los atributos de seguridad de todas las cookies emitidas por el servidor en la sesión inicial. Verifica que cuenten activamente con los flags Secure, HttpOnly y la directiva SameSite configurada en Strict o Lax.', 
 'COOKIES_SESSION'),
('9. Mapeo y Exposición de Paneles de Administración', 
 'Escanea y verifica la exposición de endpoints sensibles de administración o métricas como /admin, /dashboard, /actuator/health, /kibana o interfaces de gestión que no deban estar indexadas públicamente.', 
 'ADMIN_EXPOSURE'),
('10. Auditoría de TLS/SSL y Redirecciones de Seguridad', 
 'Verifica que todo el tráfico HTTP no cifrado se redirija forzosamente a HTTPS (301/302). Evalúa la validez de las cabeceras Strict-Transport-Security (HSTS) incluyendo la directiva includeSubDomains y preload.', 
 'TLS_HSTS'),
('11. Detección de Respuestas Verbosas y Trazas de Error (Stack Traces)', 
 'Fuerza respuestas de error provocando solicitudes malformadas para verificar si el servidor expone información técnica del stack tecnológico, trazas de depuración de frameworks (Node/Express, Spring, Laravel) o versiones exactas.', 
 'ERROR_LEAKAGE'),
('12. Evaluación de Protección contra CSRF y Validaciones de Métodos HTTP', 
 'Analiza el comportamiento de la aplicación ante peticiones cross-site. Verifica el manejo de encabezados personalizados en métodos modificadores (POST, PUT, DELETE) y la consistencia en el control de orígenes.', 
 'CSRF_PROTECTION'),
('13. Análisis de Metadatos y Archivos de Indexación (Robots & Sitemap)', 
 'Audita el contenido de robots.txt y sitemap.xml en busca de rutas privadas o carpetas sensibles omitidas explícitamente pero reveladas a atacantes mediante motores de búsqueda.', 
 'RECON_METADATA'),
('14. Escaneo de Archivos Temporales y Respaldos de Servidor Web', 
 'Busca la presencia accidental de archivos de respaldo o copias de seguridad de código creadas por editores o despliegues, como .bak, .old, .zip, config.php.swp o database.dump.', 
 'BACKUP_FILES'),
('15. Validación de Políticas de Tipos de Contenido (MIME-Sniffing & XSS)', 
 'Inspecciona las respuestas HTTP para garantizar la presencia de X-Content-Type-Options: nosniff, y audita las reglas de carga de scripts e imágenes definidas en la política de seguridad de contenidos (CSP).', 
 'XSS_CSP');