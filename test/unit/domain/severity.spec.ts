import { describe, it, expect } from 'vitest';
import { Severity } from '../../../src/domain/finding/severity';
import { InvalidSeverityError } from '../../../src/domain/errors/domain.error';

describe('Severity Value Object', () => {
  it('should accept valid severity levels', () => {
    expect(Severity.create('critical').value).toBe('critical');
    expect(Severity.create('serious').value).toBe('serious');
    expect(Severity.create('moderate').value).toBe('moderate');
    expect(Severity.create('minor').value).toBe('minor');
  });

  it('should normalize casing and whitespace', () => {
    expect(Severity.create(' CRITICAL ').value).toBe('critical');
  });

  it('should provide factory methods for common severities', () => {
    expect(Severity.critical().value).toBe('critical');
    expect(Severity.serious().value).toBe('serious');
    expect(Severity.moderate().value).toBe('moderate');
    expect(Severity.minor().value).toBe('minor');
  });

  it('should reject invalid severities with InvalidSeverityError', () => {
    expect(() => Severity.create('unknown')).toThrow(InvalidSeverityError);
    expect(() => Severity.create('low')).toThrow(InvalidSeverityError);
    expect(() => Severity.create('')).toThrow(InvalidSeverityError);
  });

  it('should support equality comparison', () => {
    const s1 = Severity.critical();
    const s2 = Severity.create('critical');
    const s3 = Severity.minor();

    expect(s1.equals(s2)).toBe(true);
    expect(s1.equals(s3)).toBe(false);
  });
});
