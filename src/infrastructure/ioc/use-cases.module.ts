import { Module, Global } from '@nestjs/common';
import { CreateAuditUseCase } from '../../application/use-cases/create-audit.use-case';
import { GetAuditUseCase } from '../../application/use-cases/get-audit.use-case';
import { ListAuditsUseCase } from '../../application/use-cases/list-audits.use-case';
import { GetFindingsUseCase } from '../../application/use-cases/get-findings.use-case';
import { GetFindingUseCase } from '../../application/use-cases/get-finding.use-case';
import { InspectPatternUseCase } from '../../application/use-cases/inspect-pattern.use-case';
import { ProposeRemediationUseCase } from '../../application/use-cases/propose-remediation.use-case';
import { ApproveRemediationUseCase } from '../../application/use-cases/approve-remediation.use-case';
import { ApplyRemediationUseCase } from '../../application/use-cases/apply-remediation.use-case';
import { GetRemediationsUseCase } from '../../application/use-cases/get-remediations.use-case';
import { VerifyRemediationUseCase } from '../../application/use-cases/verify-remediation.use-case';
import { GenerateRegressionTestUseCase } from '../../application/use-cases/generate-regression-test.use-case';
import {
  AUDIT_REPOSITORY_PORT,
  AuditRepositoryPort,
} from '../../application/ports/audit-repository.port';
import {
  FINDING_REPOSITORY_PORT,
  FindingRepositoryPort,
} from '../../application/ports/finding-repository.port';
import {
  REMEDIATION_REPOSITORY_PORT,
  RemediationRepositoryPort,
} from '../../application/ports/remediation-repository.port';
import {
  BROWSER_INSPECTOR_PORT,
  BrowserInspectorPort,
} from '../../application/ports/browser-inspector.port';
import {
  ACCESSIBILITY_SCANNER_PORT,
  AccessibilityScannerPort,
} from '../../application/ports/accessibility-scanner.port';
import { PatternRegistry } from '../../domain/pattern/pattern-registry';
import { PATTERN_REGISTRY_TOKEN } from './engine.module';

@Global()
@Module({
  providers: [
    {
      provide: CreateAuditUseCase,
      useFactory: (
        auditRepo: AuditRepositoryPort,
        findingRepo: FindingRepositoryPort,
        browserInspector: BrowserInspectorPort,
        accessibilityScanner: AccessibilityScannerPort,
        patternRegistry: PatternRegistry,
      ): CreateAuditUseCase => {
        return new CreateAuditUseCase(
          auditRepo,
          findingRepo,
          browserInspector,
          accessibilityScanner,
          patternRegistry,
        );
      },
      inject: [
        AUDIT_REPOSITORY_PORT,
        FINDING_REPOSITORY_PORT,
        BROWSER_INSPECTOR_PORT,
        ACCESSIBILITY_SCANNER_PORT,
        PATTERN_REGISTRY_TOKEN,
      ],
    },
    {
      provide: GetAuditUseCase,
      useFactory: (auditRepo: AuditRepositoryPort): GetAuditUseCase => {
        return new GetAuditUseCase(auditRepo);
      },
      inject: [AUDIT_REPOSITORY_PORT],
    },
    {
      provide: ListAuditsUseCase,
      useFactory: (auditRepo: AuditRepositoryPort): ListAuditsUseCase => {
        return new ListAuditsUseCase(auditRepo);
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
    {
      provide: ProposeRemediationUseCase,
      useFactory: (
        findingRepo: FindingRepositoryPort,
        remediationRepo: RemediationRepositoryPort,
        patternRegistry: PatternRegistry,
      ): ProposeRemediationUseCase => {
        return new ProposeRemediationUseCase(findingRepo, remediationRepo, patternRegistry);
      },
      inject: [FINDING_REPOSITORY_PORT, REMEDIATION_REPOSITORY_PORT, PATTERN_REGISTRY_TOKEN],
    },
    {
      provide: ApproveRemediationUseCase,
      useFactory: (remediationRepo: RemediationRepositoryPort): ApproveRemediationUseCase => {
        return new ApproveRemediationUseCase(remediationRepo);
      },
      inject: [REMEDIATION_REPOSITORY_PORT],
    },
    {
      provide: ApplyRemediationUseCase,
      useFactory: (remediationRepo: RemediationRepositoryPort): ApplyRemediationUseCase => {
        return new ApplyRemediationUseCase(remediationRepo);
      },
      inject: [REMEDIATION_REPOSITORY_PORT],
    },
    {
      provide: GetRemediationsUseCase,
      useFactory: (remediationRepo: RemediationRepositoryPort): GetRemediationsUseCase => {
        return new GetRemediationsUseCase(remediationRepo);
      },
      inject: [REMEDIATION_REPOSITORY_PORT],
    },
    {
      provide: VerifyRemediationUseCase,
      useFactory: (
        findingRepo: FindingRepositoryPort,
        patternRegistry: PatternRegistry,
      ): VerifyRemediationUseCase => {
        return new VerifyRemediationUseCase(findingRepo, patternRegistry);
      },
      inject: [FINDING_REPOSITORY_PORT, PATTERN_REGISTRY_TOKEN],
    },
    {
      provide: GenerateRegressionTestUseCase,
      useFactory: (
        findingRepo: FindingRepositoryPort,
        auditRepo: AuditRepositoryPort,
      ): GenerateRegressionTestUseCase => {
        return new GenerateRegressionTestUseCase(findingRepo, auditRepo);
      },
      inject: [FINDING_REPOSITORY_PORT, AUDIT_REPOSITORY_PORT],
    },
  ],
  exports: [
    CreateAuditUseCase,
    GetAuditUseCase,
    ListAuditsUseCase,
    GetFindingsUseCase,
    GetFindingUseCase,
    InspectPatternUseCase,
    ProposeRemediationUseCase,
    ApproveRemediationUseCase,
    ApplyRemediationUseCase,
    GetRemediationsUseCase,
    VerifyRemediationUseCase,
    GenerateRegressionTestUseCase,
  ],
})
export class UseCasesModule {}
