import DatabaseConstructor, { Database as DatabaseInstance } from 'better-sqlite3';
import * as fs from 'node:fs';
import * as path from 'node:path';

function getDatabaseConstructor(): typeof DatabaseConstructor {
  if (typeof DatabaseConstructor === 'function') {
    return DatabaseConstructor;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (DatabaseConstructor as any)?.default || DatabaseConstructor;
}

/**
 * Creates and initializes a SQLite database connection with idempotent schema migration.
 */
export function createSqliteDatabase(dbPath = ':memory:'): DatabaseInstance {
  if (dbPath !== ':memory:') {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  const DBClass = getDatabaseConstructor();
  const db = new DBClass(dbPath);

  // Enable WAL mode for high concurrency and foreign keys for integrity
  if (dbPath !== ':memory:') {
    db.pragma('journal_mode = WAL');
  }
  db.pragma('foreign_keys = ON');

  initSchema(db);

  return db;
}

function initSchema(db: DatabaseInstance): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS audits (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      started_at TEXT,
      completed_at TEXT,
      error_message TEXT,
      findings_count INTEGER NOT NULL DEFAULT 0,
      page_url TEXT,
      page_title TEXT,
      page_dom_snapshot TEXT,
      page_inspected_at TEXT
    );

    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      audit_id TEXT NOT NULL,
      pattern_type TEXT,
      rule_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      message TEXT NOT NULL,
      help_url TEXT,
      selector_css TEXT NOT NULL,
      selector_role TEXT,
      selector_name TEXT,
      selector_xpath TEXT,
      html_snippet TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS remediations (
      id TEXT PRIMARY KEY,
      finding_id TEXT NOT NULL,
      status TEXT NOT NULL,
      proposal_title TEXT NOT NULL,
      proposal_description TEXT NOT NULL,
      proposal_diff TEXT,
      proposal_attributes TEXT,
      created_at TEXT NOT NULL,
      approved_at TEXT,
      applied_at TEXT,
      rejected_at TEXT,
      rejection_reason TEXT,
      FOREIGN KEY (finding_id) REFERENCES findings(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_findings_audit_id ON findings(audit_id);
    CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
    CREATE INDEX IF NOT EXISTS idx_remediations_finding_id ON remediations(finding_id);
    CREATE INDEX IF NOT EXISTS idx_remediations_status ON remediations(status);
  `);
}
