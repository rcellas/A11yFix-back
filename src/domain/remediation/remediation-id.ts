import { randomUUID } from 'node:crypto';
import { EntityId } from '../common/entity-id';

export class RemediationId extends EntityId {
  private constructor(value: string) {
    super(value, 'Remediation');
  }

  public static create(): RemediationId {
    return new RemediationId(randomUUID());
  }

  public static fromString(value: string): RemediationId {
    return new RemediationId(value);
  }
}
