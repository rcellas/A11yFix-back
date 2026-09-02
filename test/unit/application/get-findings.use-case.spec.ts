import { describe, it, expect, vi } from 'vitest';
import { GetFindingsUseCase } from '../../../src/application/use-cases/get-findings.use-case';
import { FindingRepositoryPort } from '../../../src/application/ports/finding-repository.port';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';

describe('GetFindingsUseCase', () => {
  it('should return all findings for a given audit id', async () => {
    const auditId = AuditId.create();
    const finding1 = Finding.create({
      auditId,
      ruleId: 'axe:color-contrast',
      severity: Severity.serious(),
      message: 'Color contrast violation',
      targetSelector: ElementSelector.fromCss('.text'),
      htmlSnippet: '<p class="text">Hello</p>',
    });

    const mockRepo: FindingRepositoryPort = {
      saveMany: vi.fn(),
      findById: vi.fn(),
      findByAuditId: vi.fn().mockResolvedValue([finding1]),
    };

    const useCase = new GetFindingsUseCase(mockRepo);
    const results = await useCase.execute({ auditId: auditId.value });

    expect(results).toHaveLength(1);
    expect(results[0].id).toBe(finding1.id.value);
    expect(results[0].ruleId).toBe('axe:color-contrast');
    expect(mockRepo.findByAuditId).toHaveBeenCalledWith(auditId);
  });
});
