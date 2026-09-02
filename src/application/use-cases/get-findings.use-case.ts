import { FindingRepositoryPort } from '../ports/finding-repository.port';
import { GetFindingsInput, FindingOutput } from '../dto/finding.dto';
import { AuditId } from '../../domain/audit/audit-id';

/**
 * Use case: Retrieves all accessibility findings discovered for a specific audit.
 */
export class GetFindingsUseCase {
  constructor(private readonly findingRepository: FindingRepositoryPort) {}

  public async execute(input: GetFindingsInput): Promise<FindingOutput[]> {
    const auditId = AuditId.fromString(input.auditId);
    const findings = await this.findingRepository.findByAuditId(auditId);

    return findings.map((finding) => finding.toJSON());
  }
}
