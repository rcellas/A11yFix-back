import { AuditRepositoryPort } from '../ports/audit-repository.port';
import { GetAuditInput, AuditOutput } from '../dto/audit.dto';
import { AuditId } from '../../domain/audit/audit-id';

/**
 * Use case: Retrieves an existing audit by identifier.
 */
export class GetAuditUseCase {
  constructor(private readonly auditRepository: AuditRepositoryPort) {}

  public async execute(input: GetAuditInput): Promise<AuditOutput | null> {
    const auditId = AuditId.fromString(input.id);
    const audit = await this.auditRepository.findById(auditId);

    if (!audit) {
      return null;
    }

    return audit.toJSON();
  }
}
