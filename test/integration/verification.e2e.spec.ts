import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/infrastructure/http/modules/app.module';
import { ProblemDetailsFilter } from '../../src/infrastructure/http/filters/problem-details.filter';
import { AUDIT_REPOSITORY_PORT, AuditRepositoryPort } from '../../src/application/ports/audit-repository.port';
import { FINDING_REPOSITORY_PORT, FindingRepositoryPort } from '../../src/application/ports/finding-repository.port';
import { Audit } from '../../src/domain/audit/audit';
import { TargetUrl } from '../../src/domain/audit/target-url';
import { Finding } from '../../src/domain/finding/finding';
import { Severity } from '../../src/domain/finding/severity';
import { ElementSelector } from '../../src/domain/finding/element-selector';
import { PatternType } from '../../src/domain/pattern/pattern-type';

describe('Verification and Regression Test HTTP API (E2E)', () => {
  let app: INestApplication;
  let auditRepo: AuditRepositoryPort;
  let findingRepo: FindingRepositoryPort;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ProblemDetailsFilter());
    await app.init();

    auditRepo = app.get<AuditRepositoryPort>(AUDIT_REPOSITORY_PORT);
    findingRepo = app.get<FindingRepositoryPort>(FINDING_REPOSITORY_PORT);
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /findings/:id/verify should execute behavioral verification', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com/checkout'));
    await auditRepo.save(audit);

    const finding = Finding.create({
      auditId: audit.id,
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-focus-trap',
      severity: Severity.critical(),
      message: 'Focus trap missing',
      targetSelector: ElementSelector.create({
        cssSelector: '#dialog',
        role: 'dialog',
        accessibleName: 'Checkout Modal',
      }),
      htmlSnippet: '<div id="dialog" role="dialog"></div>',
    });
    await findingRepo.saveMany([finding]);

    const res = await request(app.getHttpServer())
      .post(`/findings/${finding.id.value}/verify`)
      .send({ focusTrapped: true, dispatchedKeys: ['Tab', 'Escape'] })
      .expect(200);

    expect(res.body.status).toBe('passed');
    expect(res.body.checks.length).toBeGreaterThan(0);
    expect(res.body.summary).toBeDefined();
  });

  it('POST /findings/:id/regression-test should return generated Playwright TypeScript test', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com/checkout'));
    await auditRepo.save(audit);

    const finding = Finding.create({
      auditId: audit.id,
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-modal-attribute',
      severity: Severity.serious(),
      message: 'Modal dialog should declare aria-modal="true"',
      targetSelector: ElementSelector.create({
        cssSelector: '#dialog',
        role: 'dialog',
        accessibleName: 'Checkout Dialog',
      }),
      htmlSnippet: '<div id="dialog" role="dialog"></div>',
    });
    await findingRepo.saveMany([finding]);

    const res = await request(app.getHttpServer())
      .post(`/findings/${finding.id.value}/regression-test`)
      .expect(200);

    expect(res.body.findingId).toBe(finding.id.value);
    expect(res.body.framework).toBe('playwright');
    expect(res.body.code).toContain("import { test, expect } from '@playwright/test';");
    expect(res.body.code).toContain("page.getByRole('dialog' as const, { name: 'Checkout Dialog' })");
  });
});
