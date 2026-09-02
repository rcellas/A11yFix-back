import { Finding } from '../../domain/finding/finding';
import { FindingId } from '../../domain/finding/finding-id';
import { AuditId } from '../../domain/audit/audit-id';

/**
 * Driven port interface for Finding aggregate persistence.
 * Pure TypeScript, zero framework dependencies.
 */
export interface FindingRepositoryPort {
  saveMany(findings: Finding[]): Promise<void>;
  findById(id: FindingId): Promise<Finding | null>;
  findByAuditId(auditId: AuditId): Promise<Finding[]>;
}

export const FINDING_REPOSITORY_PORT = Symbol('FINDING_REPOSITORY_PORT');
