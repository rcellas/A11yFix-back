import { describe, it, expect, vi } from 'vitest';
import { GetFindingUseCase } from '../../../src/application/use-cases/get-finding.use-case';
import { FindingRepositoryPort } from '../../../src/application/ports/finding-repository.port';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { FindingId } from '../../../src/domain/finding/finding-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';

describe('GetFindingUseCase', () => {
  it('should return finding output when found by id', async () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      ruleId: 'axe:label',
      severity: Severity.critical(),
      message: 'Form input missing label',
      targetSelector: ElementSelector.fromCss('input#user'),
      htmlSnippet: '<input id="user" />',
    });

    const mockRepo: FindingRepositoryPort = {
      saveMany: vi.fn(),
      findById: vi.fn().mockResolvedValue(finding),
      findByAuditId: vi.fn(),
    };

    const useCase = new GetFindingUseCase(mockRepo);
    const result = await useCase.execute({ id: finding.id.value });

    expect(result).toBeDefined();
    expect(result?.id).toBe(finding.id.value);
    expect(result?.ruleId).toBe('axe:label');
    expect(mockRepo.findById).toHaveBeenCalledWith(finding.id);
  });

  it('should return null when finding does not exist', async () => {
    const mockRepo: FindingRepositoryPort = {
      saveMany: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findByAuditId: vi.fn(),
    };

    const useCase = new GetFindingUseCase(mockRepo);
    const result = await useCase.execute({ id: FindingId.create().value });

    expect(result).toBeNull();
  });
});
