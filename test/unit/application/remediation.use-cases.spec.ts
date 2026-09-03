import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProposeRemediationUseCase } from '../../../src/application/use-cases/propose-remediation.use-case';
import { ApproveRemediationUseCase } from '../../../src/application/use-cases/approve-remediation.use-case';
import { ApplyRemediationUseCase } from '../../../src/application/use-cases/apply-remediation.use-case';
import { GetRemediationsUseCase } from '../../../src/application/use-cases/get-remediations.use-case';
import { FindingRepositoryPort } from '../../../src/application/ports/finding-repository.port';
import { RemediationRepositoryPort } from '../../../src/application/ports/remediation-repository.port';
import { PatternRegistry } from '../../../src/domain/pattern/pattern-registry';
import { DialogPattern } from '../../../src/domain/pattern/dialog.pattern';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';
import { Remediation } from '../../../src/domain/remediation/remediation';
import { ApprovalRequiredError, EntityNotFoundError } from '../../../src/domain/errors/domain.error';

describe('Remediation Use Cases', () => {
  let findingRepo: FindingRepositoryPort;
  let remediationRepo: RemediationRepositoryPort;
  let patternRegistry: PatternRegistry;
  let savedRemediations: Map<string, Remediation>;

  beforeEach(() => {
    savedRemediations = new Map();

    findingRepo = {
      saveMany: vi.fn(),
      findById: vi.fn(),
      findByAuditId: vi.fn(),
    };

    remediationRepo = {
      save: vi.fn().mockImplementation(async (r: Remediation) => {
        savedRemediations.set(r.id.value, r);
      }),
      findById: vi.fn().mockImplementation(async (id) => savedRemediations.get(id.value) ?? null),
      findByFindingId: vi.fn().mockImplementation(async (fId) =>
        Array.from(savedRemediations.values()).filter((r) => r.findingId.value === fId.value),
      ),
    };

    patternRegistry = new PatternRegistry();
    patternRegistry.register(new DialogPattern());
  });

  it('ProposeRemediationUseCase should generate and persist fix proposals for dialog pattern finding', async () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-accessible-name',
      severity: Severity.serious(),
      message: 'Dialog missing accessible name',
      targetSelector: ElementSelector.fromCss('#modal'),
      htmlSnippet: '<div id="modal" role="dialog"></div>',
    });

    vi.mocked(findingRepo.findById).mockResolvedValue(finding);

    const useCase = new ProposeRemediationUseCase(findingRepo, remediationRepo, patternRegistry);
    const results = await useCase.execute({ findingId: finding.id.value });

    expect(results.length).toBeGreaterThanOrEqual(2);
    expect(results[0].status).toBe('proposed');
    expect(results[0].findingId).toBe(finding.id.value);
    expect(savedRemediations.size).toBe(results.length);
  });

  it('ApproveRemediationUseCase and ApplyRemediationUseCase lifecycle flow', async () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      ruleId: 'axe:aria-label',
      severity: Severity.serious(),
      message: 'Missing label',
      targetSelector: ElementSelector.fromCss('button'),
      htmlSnippet: '<button></button>',
    });

    const remediation = Remediation.propose(finding.id, {
      title: 'Add aria-label',
      description: 'Provide explicit label',
      suggestedDiff: '+ aria-label="Submit"',
    });
    savedRemediations.set(remediation.id.value, remediation);

    const approveUseCase = new ApproveRemediationUseCase(remediationRepo);
    const applyUseCase = new ApplyRemediationUseCase(remediationRepo);
    const getUseCase = new GetRemediationsUseCase(remediationRepo);

    // Apply before approve must fail
    await expect(applyUseCase.execute({ remediationId: remediation.id.value })).rejects.toThrow(
      ApprovalRequiredError,
    );

    // Approve
    const approved = await approveUseCase.execute({ remediationId: remediation.id.value });
    expect(approved.status).toBe('approved');
    expect(approved.approvedAt).toBeDefined();

    // Apply
    const applied = await applyUseCase.execute({ remediationId: remediation.id.value });
    expect(applied.status).toBe('applied');
    expect(applied.appliedAt).toBeDefined();

    // Query by finding
    const list = await getUseCase.execute({ findingId: finding.id.value });
    expect(list).toHaveLength(1);
    expect(list[0].status).toBe('applied');
  });

  it('should throw EntityNotFoundError when finding does not exist for proposal', async () => {
    vi.mocked(findingRepo.findById).mockResolvedValue(null);

    const useCase = new ProposeRemediationUseCase(findingRepo, remediationRepo, patternRegistry);
    await expect(
      useCase.execute({ findingId: '11111111-1111-4111-a111-111111111111' }),
    ).rejects.toThrow(EntityNotFoundError);
  });
});
