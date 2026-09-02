import { InvalidPatternTypeError } from '../errors/domain.error';

export const PATTERN_TYPES = ['DIALOG', 'TABS', 'DISCLOSURE', 'COMBOBOX'] as const;

export type PatternTypeValue = (typeof PATTERN_TYPES)[number];

/**
 * Value Object representing a WAI-ARIA accessibility design pattern.
 */
export class PatternType {
  private readonly _value: PatternTypeValue;

  private constructor(value: string) {
    const normalized = value?.toUpperCase().trim();
    if (!PatternType.isValid(normalized)) {
      throw new InvalidPatternTypeError(value);
    }
    this._value = normalized as PatternTypeValue;
  }

  public static create(value: string): PatternType {
    return new PatternType(value);
  }

  public static dialog(): PatternType {
    return new PatternType('DIALOG');
  }

  public static tabs(): PatternType {
    return new PatternType('TABS');
  }

  public static disclosure(): PatternType {
    return new PatternType('DISCLOSURE');
  }

  public static combobox(): PatternType {
    return new PatternType('COMBOBOX');
  }

  public get value(): PatternTypeValue {
    return this._value;
  }

  public equals(other?: PatternType | null): boolean {
    if (!other) return false;
    return this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }

  public static isValid(value: unknown): value is PatternTypeValue {
    return typeof value === 'string' && PATTERN_TYPES.includes(value as PatternTypeValue);
  }
}
