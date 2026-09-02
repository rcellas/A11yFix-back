import { describe, it, expect, beforeEach } from 'vitest';
import { PatternRegistry } from '../../../src/domain/pattern/pattern-registry';
import { PatternType } from '../../../src/domain/pattern/pattern-type';
import { AccessibilityPattern } from '../../../src/domain/pattern/accessibility-pattern.interface';
import {
  PatternContext,
  DetectionResult,
  PatternAudit,
  PatternRuleViolation,
  FixProposal,
  VerificationResult,
} from '../../../src/domain/pattern/pattern-context';
import {
  PatternAlreadyRegisteredError,
  PatternNotSupportedError,
} from '../../../src/domain/errors/domain.error';
import { VerificationStatus } from '../../../src/domain/verification/verification-status';

// Test double factory creating a mock pattern
function createMockPattern(type: PatternType, detectOutcome: DetectionResult): AccessibilityPattern {
  return {
    type,
    detect: (_context: PatternContext) => detectOutcome,
    inspect: (_context: PatternContext): PatternAudit => ({
      passed: true,
      violations: [],
      inspectedAt: new Date(),
    }),
    proposeFix: (_violation: PatternRuleViolation): FixProposal[] => [],
    verify: (_finding, _ctx): VerificationResult => ({
      status: VerificationStatus.passed(),
      testedAt: new Date(),
      checks: [],
      summary: 'Verified',
    }),
  };
}

describe('PatternRegistry', () => {
  let registry: PatternRegistry;

  beforeEach(() => {
    registry = new PatternRegistry();
  });

  it('should register and retrieve a pattern plugin by PatternType and string', () => {
    const dialogPattern = createMockPattern(PatternType.dialog(), {
      detected: true,
      confidence: 0.9,
      matchedElement: { tagName: 'div', attributes: { role: 'dialog' }, outerHtml: '<div role="dialog"></div>' },
    });

    registry.register(dialogPattern);

    expect(registry.has(PatternType.dialog())).toBe(true);
    expect(registry.has('DIALOG')).toBe(true);
    expect(registry.has('dialog')).toBe(true);
    expect(registry.get(PatternType.dialog())).toBe(dialogPattern);
    expect(registry.getOrThrow('DIALOG')).toBe(dialogPattern);
  });

  it('should reject registering a duplicate pattern type', () => {
    const p1 = createMockPattern(PatternType.tabs(), {
      detected: false,
      confidence: 0,
      matchedElement: { tagName: 'div', attributes: {}, outerHtml: '' },
    });
    const p2 = createMockPattern(PatternType.tabs(), {
      detected: false,
      confidence: 0,
      matchedElement: { tagName: 'div', attributes: {}, outerHtml: '' },
    });

    registry.register(p1);
    expect(() => registry.register(p2)).toThrow(PatternAlreadyRegisteredError);
  });

  it('should throw PatternNotSupportedError when getOrThrow does not find pattern', () => {
    expect(() => registry.getOrThrow(PatternType.combobox())).toThrow(PatternNotSupportedError);
    expect(() => registry.getOrThrow('UNKNOWN')).toThrow(PatternNotSupportedError);
  });

  it('should return all registered patterns', () => {
    const p1 = createMockPattern(PatternType.dialog(), { detected: false, confidence: 0, matchedElement: { tagName: 'div', attributes: {}, outerHtml: '' } });
    const p2 = createMockPattern(PatternType.tabs(), { detected: false, confidence: 0, matchedElement: { tagName: 'div', attributes: {}, outerHtml: '' } });

    registry.register(p1);
    registry.register(p2);

    expect(registry.getAll()).toHaveLength(2);
    expect(registry.getAll()).toContain(p1);
    expect(registry.getAll()).toContain(p2);
  });

  it('should detect patterns and sort by confidence descending', () => {
    const mockElement = { tagName: 'div', attributes: { role: 'dialog' }, outerHtml: '<div role="dialog"></div>' };
    const context: PatternContext = { targetElement: mockElement };

    const pDialog = createMockPattern(PatternType.dialog(), {
      detected: true,
      confidence: 0.95,
      matchedElement: mockElement,
    });

    const pDisclosure = createMockPattern(PatternType.disclosure(), {
      detected: true,
      confidence: 0.6,
      matchedElement: mockElement,
    });

    const pTabs = createMockPattern(PatternType.tabs(), {
      detected: false,
      confidence: 0.1,
      matchedElement: mockElement,
    });

    registry.register(pDialog);
    registry.register(pDisclosure);
    registry.register(pTabs);

    const matches = registry.detectAll(context);

    // Only detected === true patterns returned
    expect(matches).toHaveLength(2);
    // Highest confidence first
    expect(matches[0].pattern.type.value).toBe('DIALOG');
    expect(matches[0].result.confidence).toBe(0.95);
    expect(matches[1].pattern.type.value).toBe('DISCLOSURE');
    expect(matches[1].result.confidence).toBe(0.6);
  });

  it('should allow clearing all registered patterns', () => {
    registry.register(
      createMockPattern(PatternType.dialog(), { detected: false, confidence: 0, matchedElement: { tagName: 'div', attributes: {}, outerHtml: '' } }),
    );
    expect(registry.getAll()).toHaveLength(1);

    registry.clear();
    expect(registry.getAll()).toHaveLength(0);
  });
});
