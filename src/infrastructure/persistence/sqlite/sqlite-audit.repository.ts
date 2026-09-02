import Database from 'better-sqlite3';
import { AuditRepositoryPort } from '../../../application/ports/audit-repository.port';
import { Audit } from '../../../domain/audit/audit';
import { AuditId } from '../../../domain/audit/audit-id';

interface AuditRow {
  id: string;
  url: string;
  status: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  findings_count: number;
  page_url: string | null;
  page_title: string | null;
  page_dom_snapshot: string | null;
  page_inspected_at: string | null;
}

/**
 * SQLite implementation of AuditRepositoryPort.
 * Isolated in infrastructure layer; maps domain aggregates without leaking SQL.
 */
export class SqliteAuditRepository implements AuditRepositoryPort {
  private readonly upsertStmt: Database.Statement;
  private readonly findByIdStmt: Database.Statement;

  constructor(private readonly db: Database.Database) {
    this.upsertStmt = this.db.prepare(`
      INSERT INTO audits (
        id, url, status, created_at, started_at, completed_at, error_message,
        findings_count, page_url, page_title, page_dom_snapshot, page_inspected_at
      ) VALUES (
        @id, @url, @status, @created_at, @started_at, @completed_at, @error_message,
        @findings_count, @page_url, @page_title, @page_dom_snapshot, @page_inspected_at
      )
      ON CONFLICT(id) DO UPDATE SET
        url = excluded.url,
        status = excluded.status,
        started_at = excluded.started_at,
        completed_at = excluded.completed_at,
        error_message = excluded.error_message,
        findings_count = excluded.findings_count,
        page_url = excluded.page_url,
        page_title = excluded.page_title,
        page_dom_snapshot = excluded.page_dom_snapshot,
        page_inspected_at = excluded.page_inspected_at
    `);

    this.findByIdStmt = this.db.prepare(`
      SELECT * FROM audits WHERE id = ?
    `);
  }

  public async save(audit: Audit): Promise<void> {
    const raw = audit.toJSON();

    this.upsertStmt.run({
      id: raw.id,
      url: raw.url,
      status: raw.status,
      created_at: raw.createdAt,
      started_at: raw.startedAt ?? null,
      completed_at: raw.completedAt ?? null,
      error_message: raw.errorMessage ?? null,
      findings_count: raw.findingsCount,
      page_url: raw.page?.url ?? null,
      page_title: raw.page?.title ?? null,
      page_dom_snapshot: raw.page?.domSnapshotSnippet ?? null,
      page_inspected_at: raw.page?.inspectedAt ?? null,
    });
  }

  public async findById(id: AuditId): Promise<Audit | null> {
    const row = this.findByIdStmt.get(id.value) as AuditRow | undefined;
    if (!row) {
      return null;
    }

    return Audit.reconstitute({
      id: row.id,
      url: row.url,
      status: row.status,
      createdAt: row.created_at,
      startedAt: row.started_at,
      completedAt: row.completed_at,
      errorMessage: row.error_message,
      findingsCount: row.findings_count,
      page: row.page_url
        ? {
            url: row.page_url,
            title: row.page_title ?? undefined,
            domSnapshotSnippet: row.page_dom_snapshot ?? undefined,
            inspectedAt: row.page_inspected_at ?? undefined,
          }
        : null,
    });
  }
}
