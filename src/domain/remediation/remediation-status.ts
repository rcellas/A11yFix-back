import { InvalidStateTransitionError } from '../errors/domain.error';

export const REMEDIATION_STATUSES = [
  'proposed',
  'approved',
  'applied',
  'verified',
  'rejected',
] as const;

export type RemediationStatusValue = (typeof REMEDIATION_STATUSES)[number];

/**
 * Value Object representing the state machine of a Remediation.
 */
export class RemediationStatus {
  private readonly _value: RemediationStatusValue;

  private constructor(value: RemediationStatusValue) {
    this._value = value;
  }

  public static proposed(): RemediationStatus {
    return new RemediationStatus('proposed');
  }

  public static approved(): RemediationStatus {
    return new RemediationStatus('approved');
  }

  public static applied(): RemediationStatus {
    return new RemediationStatus('applied');
  }

  public static verified(): RemediationStatus {
    return new RemediationStatus('verified');
  }

  public static rejected(): RemediationStatus {
    return new RemediationStatus('rejected');
  }

  public static fromString(value: string): RemediationStatus {
    const normalized = value?.toLowerCase().trim() as RemediationStatusValue;
    if (!REMEDIATION_STATUSES.includes(normalized)) {
      throw new Error(`Invalid remediation status: "${value}".`);
    }
    return new RemediationStatus(normalized);
  }

  public get value(): RemediationStatusValue {
    return this._value;
  }

  public canTransitionTo(next: RemediationStatus): boolean {
    switch (this._value) {
      case 'proposed':
        return next.value === 'approved' || next.value === 'rejected';
      case 'approved':
        return next.value === 'applied';
      case 'applied':
        return next.value === 'verified';
      case 'verified':
      case 'rejected':
        return false;
      default:
        return false;
    }
  }

  public transitionTo(next: RemediationStatus): RemediationStatus {
    if (!this.canTransitionTo(next)) {
      throw new InvalidStateTransitionError('Remediation', this._value, next.value);
    }
    return next;
  }

  public isApproved(): boolean {
    return this._value === 'approved' || this._value === 'applied' || this._value === 'verified';
  }

  public equals(other?: RemediationStatus | null): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }
}
