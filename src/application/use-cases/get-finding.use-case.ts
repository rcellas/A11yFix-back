import { FindingRepositoryPort } from '../ports/finding-repository.port';
import { GetFindingInput, FindingOutput } from '../dto/finding.dto';
import { FindingId } from '../../domain/finding/finding-id';

/**
 * Use case: Retrieves a single finding by identifier.
 */
export class GetFindingUseCase {
  constructor(private readonly findingRepository: FindingRepositoryPort) {}

  public async execute(input: GetFindingInput): Promise<FindingOutput | null> {
    const findingId = FindingId.fromString(input.id);
    const finding = await this.findingRepository.findById(findingId);

    if (!finding) {
      return null;
    }

    return finding.toJSON();
  }
}
