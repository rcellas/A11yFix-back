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

describe('Remediations HTTP API (E2E)', () => {
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

  it('full remediation lifecycle: propose -> list -> approve -> apply', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com'));
    await auditRepo.save(audit);

    const finding = Finding.create({
      auditId: audit.id,
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-accessible-name',
      severity: Severity.serious(),
      message: 'Modal dialog lacks accessible name',
      targetSelector: ElementSelector.fromCss('#dialog'),
      htmlSnippet: '<div id="dialog" role="dialog"></div>',
    });
    await findingRepo.saveMany([finding]);

    // 1. Propose remediations
    const proposeRes = await request(app.getHttpServer())
      .post(`/findings/${finding.id.value}/remediation`)
      .expect(200);

    expect(Array.isArray(proposeRes.body)).toBe(true);
    expect(proposeRes.body.length).toBeGreaterThanOrEqual(2);
    expect(proposeRes.body[0].status).toBe('proposed');

    const remediationId = proposeRes.body[0].id;

    // 2. Query remediations for finding
    const listRes = await request(app.getHttpServer())
      .get(`/findings/${finding.id.value}/remediations`)
      .expect(200);

    expect(listRes.body.length).toBe(proposeRes.body.length);

    // 3. Attempt apply before approve (must return 400 Bad Request)
    const prematureApplyRes = await request(app.getHttpServer())
      .post(`/remediations/${remediationId}/apply`)
      .expect(400);

    expect(prematureApplyRes.body.detail).toMatch(/must be approved before application/);

    // 4. Approve remediation
    const approveRes = await request(app.getHttpServer())
      .post(`/remediations/${remediationId}/approve`)
      .expect(200);

    expect(approveRes.body.id).toBe(remediationId);
    expect(approveRes.body.status).toBe('approved');

    // 5. Apply remediation
    const applyRes = await request(app.getHttpServer())
      .post(`/remediations/${remediationId}/apply`)
      .expect(200);

    expect(applyRes.body.id).toBe(remediationId);
    expect(applyRes.body.status).toBe('applied');
  });
});
