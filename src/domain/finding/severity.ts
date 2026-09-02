import { InvalidSeverityError } from '../errors/domain.error';

export const SEVERITIES = ['critical', 'serious', 'moderate', 'minor'] as const;

export type SeverityLevel = (typeof SEVERITIES)[number];

/**
 * Value Object representing the accessibility impact severity of a finding.
 */
export class Severity {
  private readonly _value: SeverityLevel;

  private constructor(value: string) {
    const normalized = value?.toLowerCase().trim();
    if (!Severity.isValid(normalized)) {
      throw new InvalidSeverityError(value);
    }
    this._value = normalized as SeverityLevel;
  }

  public static create(value: string): Severity {
    return new Severity(value);
  }

  public static critical(): Severity {
    return new Severity('critical');
  }

  public static serious(): Severity {
    return new Severity('serious');
  }

  public static moderate(): Severity {
    return new Severity('moderate');
  }

  public static minor(): Severity {
    return new Severity('minor');
  }

  public get value(): SeverityLevel {
    return this._value;
  }

  public isCritical(): boolean {
    return this._value === 'critical';
  }

  public isSerious(): boolean {
    return this._value === 'serious';
  }

  public isModerate(): boolean {
    return this._value === 'moderate';
  }

  public isMinor(): boolean {
    return this._value === 'minor';
  }

  public equals(other?: Severity | null): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }

  public static isValid(value: unknown): value is SeverityLevel {
    return typeof value === 'string' && SEVERITIES.includes(value as SeverityLevel);
  }
}
