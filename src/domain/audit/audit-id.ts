import { randomUUID } from 'node:crypto';
import { EntityId } from '../common/entity-id';

export class AuditId extends EntityId {
  private constructor(value: string) {
    super(value, 'Audit');
  }

  public static create(): AuditId {
    return new AuditId(randomUUID());
  }

  public static fromString(value: string): AuditId {
    return new AuditId(value);
  }
}
