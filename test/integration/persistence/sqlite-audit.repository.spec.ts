import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Database from 'better-sqlite3';
import { createSqliteDatabase } from '../../../src/infrastructure/persistence/sqlite/sqlite-connection.factory';
import { SqliteAuditRepository } from '../../../src/infrastructure/persistence/sqlite/sqlite-audit.repository';
import { Audit } from '../../../src/domain/audit/audit';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { Page } from '../../../src/domain/audit/page';

describe('SqliteAuditRepository (Integration)', () => {
  let db: Database.Database;
  let repository: SqliteAuditRepository;

  beforeEach(() => {
    db = createSqliteDatabase(':memory:');
    repository = new SqliteAuditRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('should save and find audit by id', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com/checkout'));
    await repository.save(audit);

    const retrieved = await repository.findById(audit.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id.value).toBe(audit.id.value);
    expect(retrieved?.url.value).toBe('https://example.com/checkout');
    expect(retrieved?.status.isCreated()).toBe(true);
    expect(retrieved?.findingsCount).toBe(0);
  });

  it('should update audit state through lifecycle transitions', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com/dashboard'));
    await repository.save(audit);

    audit.start();
    await repository.save(audit);

    let retrieved = await repository.findById(audit.id);
    expect(retrieved?.status.isRunning()).toBe(true);
    expect(retrieved?.startedAt).toBeDefined();

    const page = Page.create({
      url: TargetUrl.create('https://example.com/dashboard'),
      title: 'Dashboard Page',
      domSnapshotSnippet: '<html><body>Main</body></html>',
    });

    audit.complete(5, page);
    await repository.save(audit);

    retrieved = await repository.findById(audit.id);
    expect(retrieved?.status.isCompleted()).toBe(true);
    expect(retrieved?.findingsCount).toBe(5);
    expect(retrieved?.page?.title).toBe('Dashboard Page');
    expect(retrieved?.completedAt).toBeDefined();
  });

  it('should return null when audit does not exist', async () => {
    const audit = Audit.create(TargetUrl.create('https://example.com'));
    const retrieved = await repository.findById(audit.id);
    expect(retrieved).toBeNull();
  });
});
