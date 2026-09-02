import { AuditRepositoryPort } from '../ports/audit-repository.port';
import { CreateAuditInput, AuditOutput } from '../dto/audit.dto';
import { TargetUrl } from '../../domain/audit/target-url';
import { Audit } from '../../domain/audit/audit';

/**
 * Use case: Initiates a new accessibility audit for a public target URL.
 * 100% pure TypeScript, zero framework dependencies.
 */
export class CreateAuditUseCase {
  constructor(private readonly auditRepository: AuditRepositoryPort) {}

  public async execute(input: CreateAuditInput): Promise<AuditOutput> {
    const targetUrl = TargetUrl.create(input.url);
    const audit = Audit.create(targetUrl);

    await this.auditRepository.save(audit);

    return audit.toJSON();
  }
}
