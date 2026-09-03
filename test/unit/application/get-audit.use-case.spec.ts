import { describe, it, expect, vi } from 'vitest';
import { GetAuditUseCase } from '../../../src/application/use-cases/get-audit.use-case';
import { AuditRepositoryPort } from '../../../src/application/ports/audit-repository.port';
import { Audit } from '../../../src/domain/audit/audit';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { AuditId } from '../../../src/domain/audit/audit-id';

describe('GetAuditUseCase', () => {
  it('should return audit output when found by id', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com'));
    const mockRepo: AuditRepositoryPort = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(audit),
      findAll: vi.fn(),
    };

    const useCase = new GetAuditUseCase(mockRepo);
    const result = await useCase.execute({ id: audit.id.value });

    expect(result).toBeDefined();
    expect(result?.id).toBe(audit.id.value);
    expect(result?.url).toBe('https://example.com/');
    expect(mockRepo.findById).toHaveBeenCalledWith(audit.id);
  });

  it('should return null when audit is not found', async () => {
    const mockRepo: AuditRepositoryPort = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
    };

    const useCase = new GetAuditUseCase(mockRepo);
    const randomId = AuditId.create().value;
    const result = await useCase.execute({ id: randomId });

    expect(result).toBeNull();
  });
});
