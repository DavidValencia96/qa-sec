#!/usr/bin/env node

import { CliOptionsParser } from './cli.options.js';
import { CliRunnerService } from './cli.runner.js';

const runCli = async (): Promise<void> => {
  if (process.argv.includes('--help') || process.argv.includes('-h')) {
    CliOptionsParser.printHelp();
    process.exit(0);
  }

  try {
    const options = CliOptionsParser.parse(process.argv);
    const runner = new CliRunnerService();

    console.log('🛡️  QA-Sec Suite Security Scanner CLI');
    console.log('------------------------------------');

    const result = await runner.executeScan(options);

    console.log(result.summary);

    if (result.violationDetected && options.failOnViolation) {
      console.error('❌ Proceso terminado con fallo debido a políticas de seguridad no cumplidas.');
      process.exit(1);
    }

    console.log('🎉 Auditoría finalizada correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error durante la ejecución del CLI:', (error as Error).message);
    process.exit(1);
  }
};

runCli();