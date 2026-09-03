import { describe, it, expect, vi } from 'vitest';
import { GenerateRegressionTestUseCase } from '../../../src/application/use-cases/generate-regression-test.use-case';
import { FindingRepositoryPort } from '../../../src/application/ports/finding-repository.port';
import { AuditRepositoryPort } from '../../../src/application/ports/audit-repository.port';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';
import { Audit } from '../../../src/domain/audit/audit';
import { TargetUrl } from '../../../src/domain/audit/target-url';

describe('GenerateRegressionTestUseCase', () => {
  it('should generate Playwright test code with getByRole semantic locator for dialog finding', async () => {
    const auditId = AuditId.create();
    const audit = Audit.create(TargetUrl.create('https://example.com/checkout'), auditId);

    const finding = Finding.create({
      auditId,
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-modal-attribute',
      severity: Severity.serious(),
      message: 'Modal dialog should declare aria-modal="true"',
      targetSelector: ElementSelector.create({
        cssSelector: '#confirm-modal',
        role: 'dialog',
        accessibleName: 'Order Confirmation',
      }),
      htmlSnippet: '<div id="confirm-modal" role="dialog"></div>',
    });

    const mockFindingRepo: FindingRepositoryPort = {
      saveMany: vi.fn(),
      findById: vi.fn().mockResolvedValue(finding),
      findByAuditId: vi.fn(),
    };

    const mockAuditRepo: AuditRepositoryPort = {
      save: vi.fn(),
      findById: vi.fn().mockResolvedValue(audit),
      findAll: vi.fn(),
    };

    const useCase = new GenerateRegressionTestUseCase(mockFindingRepo, mockAuditRepo);
    const result = await useCase.execute({ findingId: finding.id.value });

    expect(result).toBeDefined();
    expect(result.framework).toBe('playwright');
    expect(result.findingId).toBe(finding.id.value);
    expect(result.code).toContain("import { test, expect } from '@playwright/test';");
    expect(result.code).toContain("page.getByRole('dialog' as const, { name: 'Order Confirmation' })");
    expect(result.code).toContain("toHaveAttribute('aria-modal', 'true')");
    expect(result.code).toContain("page.goto('https://example.com/checkout'");
  });
});
