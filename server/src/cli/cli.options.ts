import type { CliArguments, CliModuleType, RiskThreshold } from './cli.types.js';

export class CliOptionsParser {
  public static parse(argv: string[]): CliArguments {
    const args = argv.slice(2);
    
    const options: CliArguments = {
      module: 'all',
      threshold: 'HIGH',
      outputFormat: 'text',
      failOnViolation: true,
      verbose: false,
    };

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--target' || arg === '-t') {
        options.targetUrl = args[++i];
      } else if (arg === '--module' || arg === '-m') {
        options.module = (args[++i] as CliModuleType) || 'all';
      } else if (arg === '--jwt' || arg === '-j') {
        options.jwtToken = args[++i];
      } else if (arg === '--threshold') {
        options.threshold = (args[++i].toUpperCase() as RiskThreshold) || 'HIGH';
      } else if (arg === '--format' || arg === '-f') {
        options.outputFormat = (args[++i] as 'json' | 'html' | 'text') || 'text';
      } else if (arg === '--output' || arg === '-o') {
        options.outputPath = args[++i];
      } else if (arg === '--no-fail') {
        options.failOnViolation = false;
      } else if (arg === '--verbose' || arg === '-v') {
        options.verbose = true;
      }
    }

    return options;
  }

  public static printHelp(): void {
    console.log(`
🛡️ QA-Sec Suite CLI Tool (qa-sec-cli)

Uso:
  npx qa-sec-cli [opciones]

Opciones:
  -t, --target <url>       URL u Host objetivo de la auditoría (Requerido)
  -m, --module <modulo>    Módulo a auditar: web, sast, load, dast, sca, easm, redteam, all (Por defecto: all)
  -j, --jwt <token>        Token JWT para pruebas de autenticación o Red Team
  --threshold <severidad>  Umbral de fallo: CRITICAL, HIGH, MEDIUM, LOW (Por defecto: HIGH)
  -f, --format <formato>   Formato de reporte impreso: text, json, html (Por defecto: text)
  -o, --output <path>      Ruta del archivo para guardar los resultados
  --no-fail                No retorna exit code 1 aunque se superen los umbrales
  -v, --verbose            Muestra logs detallados de la ejecución
  --help                   Muestra esta ayuda

Ejemplos:
  npx qa-sec-cli --target http://localhost:3000/api/users --module redteam --threshold HIGH
  npx qa-sec-cli -t http://localhost:3000 -m dast -f json -o ./sec-report.json
`);
  }
}