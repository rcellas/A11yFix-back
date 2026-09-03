import { describe, it, expect } from 'vitest';
import { PatternType } from '../../../src/domain/pattern/pattern-type';
import { InvalidPatternTypeError } from '../../../src/domain/errors/domain.error';

describe('PatternType Value Object', () => {
  it('should accept valid WAI-ARIA pattern types', () => {
    expect(PatternType.create('DIALOG').value).toBe('DIALOG');
    expect(PatternType.create('TABS').value).toBe('TABS');
    expect(PatternType.create('DISCLOSURE').value).toBe('DISCLOSURE');
    expect(PatternType.create('COMBOBOX').value).toBe('COMBOBOX');
  });

  it('should normalize lowercase inputs to uppercase', () => {
    expect(PatternType.create('dialog').value).toBe('DIALOG');
    expect(PatternType.create(' tabs ').value).toBe('TABS');
  });

  it('should provide static factory constructors', () => {
    expect(PatternType.dialog().value).toBe('DIALOG');
    expect(PatternType.tabs().value).toBe('TABS');
    expect(PatternType.disclosure().value).toBe('DISCLOSURE');
    expect(PatternType.combobox().value).toBe('COMBOBOX');
  });

  it('should throw InvalidPatternTypeError on unsupported pattern types', () => {
    expect(() => PatternType.create('CAROUSEL')).toThrow(InvalidPatternTypeError);
    expect(() => PatternType.create('UNKNOWN_PATTERN')).toThrow(InvalidPatternTypeError);
    expect(() => PatternType.create('')).toThrow(InvalidPatternTypeError);
  });

  it('should support equality comparison', () => {
    const p1 = PatternType.dialog();
    const p2 = PatternType.create('dialog');
    const p3 = PatternType.tabs();

    expect(p1.equals(p2)).toBe(true);
    expect(p1.equals(p3)).toBe(false);
  });
});
