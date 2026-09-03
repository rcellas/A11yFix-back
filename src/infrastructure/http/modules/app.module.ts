import { Module } from '@nestjs/common';
import { HealthController } from '../controllers/health.controller';
import { AuditsController } from '../controllers/audits.controller';
import { FindingsController } from '../controllers/findings.controller';
import { PatternsController } from '../controllers/patterns.controller';
import { RemediationsController } from '../controllers/remediations.controller';
import { PersistenceModule } from '../../ioc/persistence.module';
import { EngineModule } from '../../ioc/engine.module';
import { UseCasesModule } from '../../ioc/use-cases.module';

@Module({
  imports: [PersistenceModule, EngineModule, UseCasesModule],
  controllers: [
    HealthController,
    AuditsController,
    FindingsController,
    PatternsController,
    RemediationsController,
  ],
  providers: [],
})
export class AppModule {}
