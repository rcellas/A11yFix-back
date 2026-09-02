import { randomUUID } from 'node:crypto';
import { EntityId } from '../common/entity-id';

export class FindingId extends EntityId {
  private constructor(value: string) {
    super(value, 'Finding');
  }

  public static create(): FindingId {
    return new FindingId(randomUUID());
  }

  public static fromString(value: string): FindingId {
    return new FindingId(value);
  }
}
