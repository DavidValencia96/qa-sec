import { SecurityModuleStrategy } from './module.interface.js';
import { HeaderAuditModule } from './headers.module';
import { SensitiveExposureModule } from './exposure.module';
import { InfoLeakageModule } from './leakage.module';

export const getAvailableModules = (): SecurityModuleStrategy[] => {
  return [
    new HeaderAuditModule(),
    new SensitiveExposureModule(),
    new InfoLeakageModule(),
  ];
};

export * from './module.interface.js';