import { RemediationRepositoryPort } from '../ports/remediation-repository.port';
import { ApplyRemediationInput, RemediationOutput } from '../dto/remediation.dto';
import { RemediationId } from '../../domain/remediation/remediation-id';
import { EntityNotFoundError } from '../../domain/errors/domain.error';

/**
 * Use case: Applies an approved remediation. Enforces approval invariant.
 */
export class ApplyRemediationUseCase {
  constructor(private readonly remediationRepository: RemediationRepositoryPort) {}

  public async execute(input: ApplyRemediationInput): Promise<RemediationOutput> {
    const remediationId = RemediationId.fromString(input.remediationId);
    const remediation = await this.remediationRepository.findById(remediationId);

    if (!remediation) {
      throw new EntityNotFoundError('Remediation', input.remediationId);
    }

    remediation.apply();
    await this.remediationRepository.save(remediation);

    return remediation.toJSON();
  }
}
