import { FindingRepositoryPort } from '../ports/finding-repository.port';
import { RemediationRepositoryPort } from '../ports/remediation-repository.port';
import { PatternRegistry } from '../../domain/pattern/pattern-registry';
import { ProposeRemediationInput, RemediationOutput } from '../dto/remediation.dto';
import { FindingId } from '../../domain/finding/finding-id';
import { Remediation } from '../../domain/remediation/remediation';
import { FixProposal } from '../../domain/pattern/pattern-context';
import { EntityNotFoundError } from '../../domain/errors/domain.error';

/**
 * Use case: Analyzes a finding and generates actionable remediation fix proposals.
 */
export class ProposeRemediationUseCase {
  constructor(
    private readonly findingRepository: FindingRepositoryPort,
    private readonly remediationRepository: RemediationRepositoryPort,
    private readonly patternRegistry: PatternRegistry,
  ) {}

  public async execute(input: ProposeRemediationInput): Promise<RemediationOutput[]> {
    const findingId = FindingId.fromString(input.findingId);
    const finding = await this.findingRepository.findById(findingId);

    if (!finding) {
      throw new EntityNotFoundError('Finding', input.findingId);
    }

    let proposals: FixProposal[] = [];

    if (finding.patternType) {
      const pattern = this.patternRegistry.getOrThrow(finding.patternType.value);
      proposals = pattern.proposeFix({
        ruleId: finding.ruleId,
        message: finding.message,
        severity: finding.severity,
        targetSelector: finding.targetSelector,
        htmlSnippet: finding.htmlSnippet,
        helpUrl: finding.helpUrl,
      });
    } else {
      // Fallback for generic axe rules
      proposals = [
        {
          title: `Fix ${finding.ruleId}`,
          description: finding.message,
          suggestedDiff: `<!-- Apply accessibility fix for ${finding.ruleId} -->`,
        },
      ];
    }

    const savedRemediations: Remediation[] = [];

    for (const proposal of proposals) {
      const remediation = Remediation.propose(findingId, proposal);
      await this.remediationRepository.save(remediation);
      savedRemediations.push(remediation);
    }

    return savedRemediations.map((r) => r.toJSON());
  }
}
