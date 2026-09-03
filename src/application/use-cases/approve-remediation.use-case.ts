import { RemediationRepositoryPort } from '../ports/remediation-repository.port';
import { ApproveRemediationInput, RemediationOutput } from '../dto/remediation.dto';
import { RemediationId } from '../../domain/remediation/remediation-id';
import { EntityNotFoundError } from '../../domain/errors/domain.error';

/**
 * Use case: Approves a remediation proposal.
 */
export class ApproveRemediationUseCase {
  constructor(private readonly remediationRepository: RemediationRepositoryPort) {}

  public async execute(input: ApproveRemediationInput): Promise<RemediationOutput> {
    const remediationId = RemediationId.fromString(input.remediationId);
    const remediation = await this.remediationRepository.findById(remediationId);

    if (!remediation) {
      throw new EntityNotFoundError('Remediation', input.remediationId);
    }

    remediation.approve();
    await this.remediationRepository.save(remediation);

    return remediation.toJSON();
  }
}
