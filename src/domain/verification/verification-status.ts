export const VERIFICATION_STATUSES = ['passed', 'failed'] as const;

export type VerificationStatusValue = (typeof VERIFICATION_STATUSES)[number];

export class VerificationStatus {
  private readonly _value: VerificationStatusValue;

  private constructor(value: VerificationStatusValue) {
    this._value = value;
  }

  public static passed(): VerificationStatus {
    return new VerificationStatus('passed');
  }

  public static failed(): VerificationStatus {
    return new VerificationStatus('failed');
  }

  public static fromString(value: string): VerificationStatus {
    const normalized = value?.toLowerCase().trim() as VerificationStatusValue;
    if (!VERIFICATION_STATUSES.includes(normalized)) {
      throw new Error(`Invalid verification status: "${value}". Expected "passed" or "failed".`);
    }
    return new VerificationStatus(normalized);
  }

  public get value(): VerificationStatusValue {
    return this._value;
  }

  public isPassed(): boolean {
    return this._value === 'passed';
  }

  public isFailed(): boolean {
    return this._value === 'failed';
  }

  public equals(other?: VerificationStatus | null): boolean {
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
