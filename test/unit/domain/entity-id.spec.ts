import { describe, it, expect } from 'vitest';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { FindingId } from '../../../src/domain/finding/finding-id';
import { RemediationId } from '../../../src/domain/remediation/remediation-id';
import { InvalidUuidError } from '../../../src/domain/errors/domain.error';

describe('Domain Identifiers (EntityId)', () => {
  it('should generate valid UUID v4 identifiers', () => {
    const auditId = AuditId.create();
    const findingId = FindingId.create();
    const remediationId = RemediationId.create();

    expect(auditId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(findingId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(remediationId.value).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it('should instantiate an identifier from a valid string', () => {
    const rawUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const auditId = AuditId.fromString(rawUuid);

    expect(auditId.value).toBe(rawUuid);
    expect(auditId.toString()).toBe(rawUuid);
  });

  it('should throw InvalidUuidError on invalid UUID strings', () => {
    expect(() => AuditId.fromString('not-a-uuid')).toThrow(InvalidUuidError);
    expect(() => FindingId.fromString('12345')).toThrow(InvalidUuidError);
    expect(() => RemediationId.fromString('')).toThrow(InvalidUuidError);
  });

  it('should support value equality comparisons', () => {
    const rawUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const id1 = AuditId.fromString(rawUuid);
    const id2 = AuditId.fromString(rawUuid);
    const id3 = AuditId.create();

    expect(id1.equals(id2)).toBe(true);
    expect(id1.equals(id3)).toBe(false);
    expect(id1.equals(null)).toBe(false);
  });
});
