import { InvalidStateTransitionError } from '../errors/domain.error';

export const AUDIT_STATUSES = ['created', 'running', 'completed', 'failed'] as const;

export type AuditStatusValue = (typeof AUDIT_STATUSES)[number];

/**
 * Value Object representing the state machine of an Audit.
 */
export class AuditStatus {
  private readonly _value: AuditStatusValue;

  private constructor(value: AuditStatusValue) {
    this._value = value;
  }

  public static created(): AuditStatus {
    return new AuditStatus('created');
  }

  public static running(): AuditStatus {
    return new AuditStatus('running');
  }

  public static completed(): AuditStatus {
    return new AuditStatus('completed');
  }

  public static failed(): AuditStatus {
    return new AuditStatus('failed');
  }

  public static fromString(value: string): AuditStatus {
    const normalized = value?.toLowerCase().trim() as AuditStatusValue;
    if (!AUDIT_STATUSES.includes(normalized)) {
      throw new Error(`Invalid audit status: "${value}".`);
    }
    return new AuditStatus(normalized);
  }

  public get value(): AuditStatusValue {
    return this._value;
  }

  public canTransitionTo(next: AuditStatus): boolean {
    switch (this._value) {
      case 'created':
        return next.value === 'running';
      case 'running':
        return next.value === 'completed' || next.value === 'failed';
      case 'completed':
      case 'failed':
        return false;
      default:
        return false;
    }
  }

  public transitionTo(next: AuditStatus): AuditStatus {
    if (!this.canTransitionTo(next)) {
      throw new InvalidStateTransitionError('Audit', this._value, next.value);
    }
    return next;
  }

  public equals(other?: AuditStatus | null): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  public isTerminal(): boolean {
    return this._value === 'completed' || this._value === 'failed';
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
