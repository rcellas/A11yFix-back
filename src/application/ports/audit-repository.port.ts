import { Audit } from '../../domain/audit/audit';
import { AuditId } from '../../domain/audit/audit-id';

/**
 * Driven port interface for Audit aggregate persistence.
 * Pure TypeScript, zero framework dependencies.
 */
export interface AuditRepositoryPort {
  save(audit: Audit): Promise<void>;
  findById(id: AuditId): Promise<Audit | null>;
  findAll(limit?: number): Promise<Audit[]>;
}

export const AUDIT_REPOSITORY_PORT = Symbol('AUDIT_REPOSITORY_PORT');
