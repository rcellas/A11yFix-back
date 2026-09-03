import { describe, it, expect, vi } from 'vitest';
import { CreateAuditUseCase } from '../../../src/application/use-cases/create-audit.use-case';
import { AuditRepositoryPort } from '../../../src/application/ports/audit-repository.port';
import { Audit } from '../../../src/domain/audit/audit';
import { InvalidUrlError } from '../../../src/domain/errors/domain.error';

describe('CreateAuditUseCase', () => {
  it('should create and persist a new audit for a valid URL', async () => {
    const savedAudits: Audit[] = [];
    const mockRepo: AuditRepositoryPort = {
      save: vi.fn().mockImplementation(async (audit: Audit) => {
        savedAudits.push(audit);
      }),
      findById: vi.fn(),
      findAll: vi.fn(),
    };

    const useCase = new CreateAuditUseCase(mockRepo);
    const result = await useCase.execute({ url: 'https://example.com/login' });

    expect(result).toBeDefined();
    expect(result.url).toBe('https://example.com/login');
    expect(result.status).toBe('created');
    expect(result.findingsCount).toBe(0);
    expect(mockRepo.save).toHaveBeenCalledOnce();
    expect(savedAudits).toHaveLength(1);
    expect(savedAudits[0].url.value).toBe('https://example.com/login');
  });

  it('should throw InvalidUrlError when given an invalid protocol', async () => {
    const mockRepo: AuditRepositoryPort = {
      save: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
    };

    const useCase = new CreateAuditUseCase(mockRepo);

    await expect(useCase.execute({ url: 'ftp://example.com' })).rejects.toThrow(
      InvalidUrlError,
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });
});
