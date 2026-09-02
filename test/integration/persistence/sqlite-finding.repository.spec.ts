import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createSqliteDatabase } from '../../../src/infrastructure/persistence/sqlite/sqlite-connection.factory';
import { SqliteAuditRepository } from '../../../src/infrastructure/persistence/sqlite/sqlite-audit.repository';
import { SqliteFindingRepository } from '../../../src/infrastructure/persistence/sqlite/sqlite-finding.repository';
import { Audit } from '../../../src/domain/audit/audit';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { Finding } from '../../../src/domain/finding/finding';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';

describe('SqliteFindingRepository (Integration)', () => {
  let db: Database.Database;
  let auditRepo: SqliteAuditRepository;
  let findingRepo: SqliteFindingRepository;

  beforeEach(() => {
    db = createSqliteDatabase(':memory:');
    auditRepo = new SqliteAuditRepository(db);
    findingRepo = new SqliteFindingRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should batch save and find findings by auditId and findingId', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com'));
    await auditRepo.save(audit);

    const finding1 = Finding.create({
      auditId: audit.id,
      ruleId: 'axe:color-contrast',
      severity: Severity.serious(),
      message: 'Insufficient contrast ratio',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      targetSelector: ElementSelector.fromCss('.subtext'),
      htmlSnippet: '<p class="subtext">Faded</p>',
    });

    const finding2 = Finding.create({
      auditId: audit.id,
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-accessible-name',
      severity: Severity.critical(),
      message: 'Modal dialog lacks accessible name',
      targetSelector: ElementSelector.create({
        cssSelector: '#dialog',
        role: 'dialog',
        accessibleName: undefined,
      }),
      htmlSnippet: '<div id="dialog" role="dialog"></div>',
    });

    await findingRepo.saveMany([finding1, finding2]);

    const findingsForAudit = await findingRepo.findByAuditId(audit.id);
    expect(findingsForAudit).toHaveLength(2);
    expect(findingsForAudit[0].ruleId).toBe('axe:color-contrast');
    expect(findingsForAudit[1].ruleId).toBe('pattern:dialog-accessible-name');
    expect(findingsForAudit[1].patternType?.value).toBe('DIALOG');

    const singleFinding = await findingRepo.findById(finding2.id);
    expect(singleFinding).not.toBeNull();
    expect(singleFinding?.id.value).toBe(finding2.id.value);
    expect(singleFinding?.severity.isCritical()).toBe(true);
  });
});
