import { describe, it, expect, beforeEach, vi } from 'vitest';
import { VerifyRemediationUseCase } from '../../../src/application/use-cases/verify-remediation.use-case';
import { FindingRepositoryPort } from '../../../src/application/ports/finding-repository.port';
import { PatternRegistry } from '../../../src/domain/pattern/pattern-registry';
import { DialogPattern } from '../../../src/domain/pattern/dialog.pattern';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';
import { EntityNotFoundError } from '../../../src/domain/errors/domain.error';

describe('VerifyRemediationUseCase', () => {
  let findingRepo: FindingRepositoryPort;
  let patternRegistry: PatternRegistry;

  beforeEach(() => {
    findingRepo = {
      saveMany: vi.fn(),
      findById: vi.fn(),
      findByAuditId: vi.fn(),
    };

    patternRegistry = new PatternRegistry();
    patternRegistry.register(new DialogPattern());
  });

  it('should verify dialog pattern finding with behavioral focus checks', async () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-focus-trap',
      severity: Severity.critical(),
      message: 'Focus escaped dialog container',
      targetSelector: ElementSelector.fromCss('#dialog'),
      htmlSnippet: '<div id="dialog" role="dialog"></div>',
    });

    vi.mocked(findingRepo.findById).mockResolvedValue(finding);

    const useCase = new VerifyRemediationUseCase(findingRepo, patternRegistry);
    const result = await useCase.execute({
      findingId: finding.id.value,
      focusTrapped: true,
      dispatchedKeys: ['Tab', 'Tab', 'Escape'],
    });

    expect(result).toBeDefined();
    expect(result.status).toBe('passed');
    expect(result.checks.length).toBeGreaterThan(0);
    expect(result.summary).toContain('verified');
  });

  it('should verify general axe finding with static check', async () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      ruleId: 'axe:color-contrast',
      severity: Severity.serious(),
      message: 'Low contrast',
      targetSelector: ElementSelector.fromCss('.text'),
      htmlSnippet: '<span class="text">Hello</span>',
    });

    vi.mocked(findingRepo.findById).mockResolvedValue(finding);

    const useCase = new VerifyRemediationUseCase(findingRepo, patternRegistry);
    const result = await useCase.execute({ findingId: finding.id.value });

    expect(result.status).toBe('passed');
    expect(result.checks[0].name).toContain('axe:color-contrast');
  });

  it('should throw EntityNotFoundError when finding does not exist', async () => {
    vi.mocked(findingRepo.findById).mockResolvedValue(null);

    const useCase = new VerifyRemediationUseCase(findingRepo, patternRegistry);
    await expect(
      useCase.execute({ findingId: '11111111-1111-4111-a111-111111111111' }),
    ).rejects.toThrow(EntityNotFoundError);
  });
});
