import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createSqliteDatabase } from '../../../src/infrastructure/persistence/sqlite/sqlite-connection.factory';
import { SqliteAuditRepository } from '../../../src/infrastructure/persistence/sqlite/sqlite-audit.repository';
import { SqliteFindingRepository } from '../../../src/infrastructure/persistence/sqlite/sqlite-finding.repository';
import { SqliteRemediationRepository } from '../../../src/infrastructure/persistence/sqlite/sqlite-remediation.repository';
import { Audit } from '../../../src/domain/audit/audit';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { Finding } from '../../../src/domain/finding/finding';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { Remediation } from '../../../src/domain/remediation/remediation';

describe('SqliteRemediationRepository (Integration)', () => {
  let db: Database.Database;
  let auditRepo: SqliteAuditRepository;
  let findingRepo: SqliteFindingRepository;
  let remediationRepo: SqliteRemediationRepository;

  beforeEach(() => {
    db = createSqliteDatabase(':memory:');
    auditRepo = new SqliteAuditRepository(db);
    findingRepo = new SqliteFindingRepository(db);
    remediationRepo = new SqliteRemediationRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should save, approve, apply and find remediation by id and findingId', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com'));
    await auditRepo.save(audit);

    const finding = Finding.create({
      auditId: audit.id,
      ruleId: 'pattern:dialog-modal-attribute',
      severity: Severity.moderate(),
      message: 'Modal dialog should declare aria-modal="true"',
      targetSelector: ElementSelector.fromCss('#dialog'),
      htmlSnippet: '<div id="dialog"></div>',
    });
    await findingRepo.saveMany([finding]);

    const remediation = Remediation.propose(finding.id, {
      title: 'Add aria-modal="true"',
      description: 'Scope accessibility perception to dialog',
      suggestedDiff: '+ aria-modal="true"',
      suggestedAttributes: { 'aria-modal': 'true' },
    });

    await remediationRepo.save(remediation);

    let retrieved = await remediationRepo.findById(remediation.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.status.isProposed()).toBe(true);
    expect(retrieved?.proposal.title).toBe('Add aria-modal="true"');
    expect(retrieved?.proposal.suggestedAttributes).toEqual({ 'aria-modal': 'true' });

    remediation.approve();
    remediation.apply();
    await remediationRepo.save(remediation);

    retrieved = await remediationRepo.findById(remediation.id);
    expect(retrieved?.status.isApplied()).toBe(true);
    expect(retrieved?.approvedAt).toBeDefined();
    expect(retrieved?.appliedAt).toBeDefined();

    const byFinding = await remediationRepo.findByFindingId(finding.id);
    expect(byFinding).toHaveLength(1);
    expect(byFinding[0].id.value).toBe(remediation.id.value);
  });
});
