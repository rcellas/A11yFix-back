import { Remediation } from '../../domain/remediation/remediation';
import { RemediationId } from '../../domain/remediation/remediation-id';
import { FindingId } from '../../domain/finding/finding-id';

/**
 * Driven port interface for Remediation aggregate persistence.
 * Pure TypeScript, zero framework dependencies.
 */
export interface RemediationRepositoryPort {
  save(remediation: Remediation): Promise<void>;
  findById(id: RemediationId): Promise<Remediation | null>;
  findByFindingId(findingId: FindingId): Promise<Remediation[]>;
}

export const REMEDIATION_REPOSITORY_PORT = Symbol('REMEDIATION_REPOSITORY_PORT');
