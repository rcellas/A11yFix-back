import Database from 'better-sqlite3';
import { FindingRepositoryPort } from '../../../application/ports/finding-repository.port';
import { Finding } from '../../../domain/finding/finding';
import { FindingId } from '../../../domain/finding/finding-id';
import { AuditId } from '../../../domain/audit/audit-id';

interface FindingRow {
  id: string;
  audit_id: string;
  pattern_type: string | null;
  rule_id: string;
  severity: string;
  message: string;
  help_url: string | null;
  selector_css: string;
  selector_role: string | null;
  selector_name: string | null;
  selector_xpath: string | null;
  html_snippet: string;
  created_at: string;
}

/**
 * SQLite implementation of FindingRepositoryPort.
 */
export class SqliteFindingRepository implements FindingRepositoryPort {
  private readonly insertStmt: Database.Statement;
  private readonly findByIdStmt: Database.Statement;
  private readonly findByAuditIdStmt: Database.Statement;

  constructor(private readonly db: Database.Database) {
    this.insertStmt = this.db.prepare(`
      INSERT INTO findings (
        id, audit_id, pattern_type, rule_id, severity, message, help_url,
        selector_css, selector_role, selector_name, selector_xpath,
        html_snippet, created_at
      ) VALUES (
        @id, @audit_id, @pattern_type, @rule_id, @severity, @message, @help_url,
        @selector_css, @selector_role, @selector_name, @selector_xpath,
        @html_snippet, @created_at
      )
      ON CONFLICT(id) DO UPDATE SET
        pattern_type = excluded.pattern_type,
        rule_id = excluded.rule_id,
        severity = excluded.severity,
        message = excluded.message,
        help_url = excluded.help_url,
        selector_css = excluded.selector_css,
        selector_role = excluded.selector_role,
        selector_name = excluded.selector_name,
        selector_xpath = excluded.selector_xpath,
        html_snippet = excluded.html_snippet
    `);

    this.findByIdStmt = this.db.prepare(`
      SELECT * FROM findings WHERE id = ?
    `);

    this.findByAuditIdStmt = this.db.prepare(`
      SELECT * FROM findings WHERE audit_id = ? ORDER BY created_at ASC
    `);
  }

  public async saveMany(findings: Finding[]): Promise<void> {
    if (findings.length === 0) {
      return;
    }

    const insertManyTx = this.db.transaction((items: Finding[]) => {
      for (const finding of items) {
        const raw = finding.toJSON();
        this.insertStmt.run({
          id: raw.id,
          audit_id: raw.auditId,
          pattern_type: raw.patternType ?? null,
          rule_id: raw.ruleId,
          severity: raw.severity,
          message: raw.message,
          help_url: raw.helpUrl ?? null,
          selector_css: raw.targetSelector.cssSelector,
          selector_role: raw.targetSelector.role ?? null,
          selector_name: raw.targetSelector.accessibleName ?? null,
          selector_xpath: raw.targetSelector.xpath ?? null,
          html_snippet: raw.htmlSnippet,
          created_at: raw.createdAt,
        });
      }
    });

    insertManyTx(findings);
  }

  public async findById(id: FindingId): Promise<Finding | null> {
    const row = this.findByIdStmt.get(id.value) as FindingRow | undefined;
    if (!row) {
      return null;
    }

    return this.mapRowToFinding(row);
  }

  public async findByAuditId(auditId: AuditId): Promise<Finding[]> {
    const rows = this.findByAuditIdStmt.all(auditId.value) as FindingRow[];
    return rows.map((row) => this.mapRowToFinding(row));
  }

  private mapRowToFinding(row: FindingRow): Finding {
    return Finding.reconstitute({
      id: row.id,
      auditId: row.audit_id,
      patternType: row.pattern_type ?? undefined,
      ruleId: row.rule_id,
      severity: row.severity,
      message: row.message,
      helpUrl: row.help_url ?? undefined,
      targetSelector: {
        cssSelector: row.selector_css,
        role: row.selector_role ?? undefined,
        accessibleName: row.selector_name ?? undefined,
        xpath: row.selector_xpath ?? undefined,
      },
      htmlSnippet: row.html_snippet,
      createdAt: row.created_at,
    });
  }
}
