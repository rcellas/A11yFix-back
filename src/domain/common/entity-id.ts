import { InvalidUuidError } from '../errors/domain.error';

/**
 * Base abstract value object for strongly-typed UUID v4 identifiers.
 * Prevents primitive obsession across domain aggregates.
 */
export abstract class EntityId {
  private static readonly UUID_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  protected readonly _value: string;

  protected constructor(value: string, entityName: string) {
    if (!EntityId.isValid(value)) {
      throw new InvalidUuidError(entityName, value);
    }
    this._value = value.trim().toLowerCase();
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: EntityId | null): boolean {
    if (!other) return false;
    return this.constructor === other.constructor && this._value === other._value;
  }

  public toString(): string {
    return this._value;
  }

  public toJSON(): string {
    return this._value;
  }

  public static isValid(value: string): boolean {
    return typeof value === 'string' && EntityId.UUID_REGEX.test(value.trim());
  }
}
