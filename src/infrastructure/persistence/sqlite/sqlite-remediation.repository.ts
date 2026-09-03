import Database from 'better-sqlite3';
import { RemediationRepositoryPort } from '../../../application/ports/remediation-repository.port';
import { Remediation } from '../../../domain/remediation/remediation';
import { RemediationId } from '../../../domain/remediation/remediation-id';
import { FindingId } from '../../../domain/finding/finding-id';

interface RemediationRow {
  id: string;
  finding_id: string;
  status: string;
  proposal_title: string;
  proposal_description: string;
  proposal_diff: string | null;
  proposal_attributes: string | null;
  created_at: string;
  approved_at: string | null;
  applied_at: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
}

/**
 * SQLite implementation of RemediationRepositoryPort.
 */
export class SqliteRemediationRepository implements RemediationRepositoryPort {
  private readonly upsertStmt: Database.Statement;
  private readonly findByIdStmt: Database.Statement;
  private readonly findByFindingIdStmt: Database.Statement;

  constructor(private readonly db: Database.Database) {
    this.upsertStmt = this.db.prepare(`
      INSERT INTO remediations (
        id, finding_id, status, proposal_title, proposal_description,
        proposal_diff, proposal_attributes, created_at, approved_at,
        applied_at, rejected_at, rejection_reason
      ) VALUES (
        @id, @finding_id, @status, @proposal_title, @proposal_description,
        @proposal_diff, @proposal_attributes, @created_at, @approved_at,
        @applied_at, @rejected_at, @rejection_reason
      )
      ON CONFLICT(id) DO UPDATE SET
        status = excluded.status,
        proposal_title = excluded.proposal_title,
        proposal_description = excluded.proposal_description,
        proposal_diff = excluded.proposal_diff,
        proposal_attributes = excluded.proposal_attributes,
        approved_at = excluded.approved_at,
        applied_at = excluded.applied_at,
        rejected_at = excluded.rejected_at,
        rejection_reason = excluded.rejection_reason
    `);

    this.findByIdStmt = this.db.prepare(`
      SELECT * FROM remediations WHERE id = ?
    `);

    this.findByFindingIdStmt = this.db.prepare(`
      SELECT * FROM remediations WHERE finding_id = ? ORDER BY created_at ASC
    `);
  }

  public async save(remediation: Remediation): Promise<void> {
    const raw = remediation.toJSON();

    this.upsertStmt.run({
      id: raw.id,
      finding_id: raw.findingId,
      status: raw.status,
      proposal_title: raw.proposal.title,
      proposal_description: raw.proposal.description,
      proposal_diff: raw.proposal.suggestedDiff ?? null,
      proposal_attributes: raw.proposal.suggestedAttributes
        ? JSON.stringify(raw.proposal.suggestedAttributes)
        : null,
      created_at: raw.createdAt,
      approved_at: raw.approvedAt ?? null,
      applied_at: raw.appliedAt ?? null,
      rejected_at: raw.rejectedAt ?? null,
      rejection_reason: raw.rejectionReason ?? null,
    });
  }

  public async findById(id: RemediationId): Promise<Remediation | null> {
    const row = this.findByIdStmt.get(id.value) as RemediationRow | undefined;
    if (!row) {
      return null;
    }
    return this.mapRowToRemediation(row);
  }

  public async findByFindingId(findingId: FindingId): Promise<Remediation[]> {
    const rows = this.findByFindingIdStmt.all(findingId.value) as RemediationRow[];
    return rows.map((row) => this.mapRowToRemediation(row));
  }

  private mapRowToRemediation(row: RemediationRow): Remediation {
    return Remediation.reconstitute({
      id: row.id,
      findingId: row.finding_id,
      status: row.status,
      proposal: {
        title: row.proposal_title,
        description: row.proposal_description,
        suggestedDiff: row.proposal_diff ?? undefined,
        suggestedAttributes: row.proposal_attributes
          ? JSON.parse(row.proposal_attributes)
          : undefined,
      },
      createdAt: row.created_at,
      approvedAt: row.approved_at,
      appliedAt: row.applied_at,
      rejectedAt: row.rejected_at,
      rejectionReason: row.rejection_reason,
    });
  }
}
