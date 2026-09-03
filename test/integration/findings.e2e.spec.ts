import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/infrastructure/http/modules/app.module';
import { ProblemDetailsFilter } from '../../src/infrastructure/http/filters/problem-details.filter';
import { FINDING_REPOSITORY_PORT, FindingRepositoryPort } from '../../src/application/ports/finding-repository.port';
import { Finding } from '../../src/domain/finding/finding';
import { Severity } from '../../src/domain/finding/severity';
import { ElementSelector } from '../../src/domain/finding/element-selector';
import { AUDIT_REPOSITORY_PORT, AuditRepositoryPort } from '../../src/application/ports/audit-repository.port';
import { Audit } from '../../src/domain/audit/audit';
import { TargetUrl } from '../../src/domain/audit/target-url';

describe('Findings HTTP API (E2E)', () => {
  let app: INestApplication;
  let findingRepo: FindingRepositoryPort;
  let auditRepo: AuditRepositoryPort;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalFilters(new ProblemDetailsFilter());
    await app.init();

    findingRepo = app.get<FindingRepositoryPort>(FINDING_REPOSITORY_PORT);
    auditRepo = app.get<AuditRepositoryPort>(AUDIT_REPOSITORY_PORT);
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /findings/:id should return finding when found', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com'));
    await auditRepo.save(audit);

    const finding = Finding.create({
      auditId: audit.id,
      ruleId: 'axe:color-contrast',
      severity: Severity.serious(),
      message: 'Color contrast is low',
      targetSelector: ElementSelector.fromCss('.subtext'),
      htmlSnippet: '<p class="subtext">Faded</p>',
    });
    await findingRepo.saveMany([finding]);

    const res = await request(app.getHttpServer())
      .get(`/findings/${finding.id.value}`)
      .expect(200);

    expect(res.body.id).toBe(finding.id.value);
    expect(res.body.ruleId).toBe('axe:color-contrast');
    expect(res.body.severity).toBe('serious');
  });

  it('GET /findings/:id should return 404 when not found', async () => {
    const randomUuid = '11111111-1111-4111-a111-111111111111';
    await request(app.getHttpServer())
      .get(`/findings/${randomUuid}`)
      .expect(404);
  });
});
