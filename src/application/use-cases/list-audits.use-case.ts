import { AuditRepositoryPort } from '../ports/audit-repository.port';
import { AuditOutput } from '../dto/audit.dto';

export interface ListAuditsInput {
  limit?: number;
}

/**
 * Use case: Retrieves all recent audits.
 */
export class ListAuditsUseCase {
  constructor(private readonly auditRepository: AuditRepositoryPort) {}

  public async execute(input?: ListAuditsInput): Promise<AuditOutput[]> {
    const audits = await this.auditRepository.findAll(input?.limit);
    return audits.map((a) => a.toJSON());
  }
}
