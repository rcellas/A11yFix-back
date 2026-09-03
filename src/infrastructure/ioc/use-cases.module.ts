import { Module, Global } from '@nestjs/common';
import { CreateAuditUseCase } from '../../application/use-cases/create-audit.use-case';
import { GetAuditUseCase } from '../../application/use-cases/get-audit.use-case';
import { GetFindingsUseCase } from '../../application/use-cases/get-findings.use-case';
import { GetFindingUseCase } from '../../application/use-cases/get-finding.use-case';
import { InspectPatternUseCase } from '../../application/use-cases/inspect-pattern.use-case';
import {
  AUDIT_REPOSITORY_PORT,
  AuditRepositoryPort,
} from '../../application/ports/audit-repository.port';
import {
  FINDING_REPOSITORY_PORT,
  FindingRepositoryPort,
} from '../../application/ports/finding-repository.port';
import { PatternRegistry } from '../../domain/pattern/pattern-registry';
import { PATTERN_REGISTRY_TOKEN } from './engine.module';

@Global()
@Module({
  providers: [
    {
      provide: CreateAuditUseCase,
      useFactory: (auditRepo: AuditRepositoryPort): CreateAuditUseCase => {
        return new CreateAuditUseCase(auditRepo);
      },
      inject: [AUDIT_REPOSITORY_PORT],
    },
    {
      provide: GetAuditUseCase,
      useFactory: (auditRepo: AuditRepositoryPort): GetAuditUseCase => {
        return new GetAuditUseCase(auditRepo);
      },
      inject: [AUDIT_REPOSITORY_PORT],
    },
    {
      provide: GetFindingsUseCase,
      useFactory: (findingRepo: FindingRepositoryPort): GetFindingsUseCase => {
        return new GetFindingsUseCase(findingRepo);
      },
      inject: [FINDING_REPOSITORY_PORT],
    },
    {
      provide: GetFindingUseCase,
      useFactory: (findingRepo: FindingRepositoryPort): GetFindingUseCase => {
        return new GetFindingUseCase(findingRepo);
      },
      inject: [FINDING_REPOSITORY_PORT],
    },
    {
      provide: InspectPatternUseCase,
      useFactory: (patternRegistry: PatternRegistry): InspectPatternUseCase => {
        return new InspectPatternUseCase(patternRegistry);
      },
      inject: [PATTERN_REGISTRY_TOKEN],
    },
  ],
  exports: [
    CreateAuditUseCase,
    GetAuditUseCase,
    GetFindingsUseCase,
    GetFindingUseCase,
    InspectPatternUseCase,
  ],
})
export class UseCasesModule {}
