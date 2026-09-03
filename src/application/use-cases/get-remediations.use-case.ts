import { RemediationRepositoryPort } from '../ports/remediation-repository.port';
import { GetRemediationsInput, RemediationOutput } from '../dto/remediation.dto';
import { FindingId } from '../../domain/finding/finding-id';

/**
 * Use case: Retrieves all remediations for a specific finding.
 */
export class GetRemediationsUseCase {
  constructor(private readonly remediationRepository: RemediationRepositoryPort) {}

  public async execute(input: GetRemediationsInput): Promise<RemediationOutput[]> {
    const findingId = FindingId.fromString(input.findingId);
    const remediations = await this.remediationRepository.findByFindingId(findingId);

    return remediations.map((r) => r.toJSON());
  }
}
