import { describe, it, expect, beforeEach } from 'vitest';
import { DisclosurePattern } from '../../../src/domain/pattern/disclosure.pattern';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';

describe('DisclosurePattern (P-03 Plugin)', () => {
  let pattern: DisclosurePattern;

  beforeEach(() => {
    pattern = new DisclosurePattern();
  });

  describe('Detection', () => {
    it('should detect native <details> with confidence 1.0', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'details',
          attributes: {},
          outerHtml: '<details><summary>FAQ</summary><p>Answer</p></details>',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(1.0);
    });

    it('should detect element with aria-expanded attribute', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'button',
          attributes: { 'aria-expanded': 'false' },
          outerHtml: '<button aria-expanded="false">Toggle</button>',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.95);
    });

    it('should detect accordion trigger class heuristics', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'div',
          attributes: { class: 'accordion-trigger' },
          outerHtml: '<div class="accordion-trigger">Question</div>',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.75);
    });

    it('should reject non-disclosure elements', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'input',
          attributes: { type: 'text' },
          outerHtml: '<input type="text" />',
        },
      });

      expect(result.detected).toBe(false);
    });
  });

  describe('Inspection', () => {
    it('should pass inspection for valid accessible disclosure button', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'button',
          attributes: {
            'aria-expanded': 'false',
            'aria-controls': 'faq-answer-1',
          },
          accessibleName: 'What is A11yFix?',
          outerHtml: '<button aria-expanded="false" aria-controls="faq-answer-1">What is A11yFix?</button>',
        },
      });

      expect(audit.passed).toBe(true);
      expect(audit.violations).toHaveLength(0);
    });

    it('should pass inspection for native <details>', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'details',
          attributes: {},
          outerHtml: '<details></details>',
        },
      });

      expect(audit.passed).toBe(true);
      expect(audit.violations).toHaveLength(0);
    });

    it('should flag missing button role, aria-expanded, and aria-controls on custom div trigger', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'div',
          attributes: { class: 'accordion-header' },
          outerHtml: '<div class="accordion-header">Header</div>',
        },
      });

      expect(audit.passed).toBe(false);
      const ruleIds = audit.violations.map((v) => v.ruleId);
      expect(ruleIds).toContain('pattern:disclosure-trigger-role');
      expect(ruleIds).toContain('pattern:disclosure-aria-expanded');
      expect(ruleIds).toContain('pattern:disclosure-aria-controls');
    });
  });

  describe('Fix Proposals', () => {
    it('should propose fixes for missing button role', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:disclosure-trigger-role',
        message: 'Missing button role',
        severity: Severity.critical(),
        targetSelector: ElementSelector.fromCss('.accordion-header'),
        htmlSnippet: '<div></div>',
      });

      expect(proposals).toHaveLength(1);
      expect(proposals[0].suggestedAttributes).toEqual({ role: 'button', tabindex: '0' });
    });

    it('should propose fixes for missing aria-expanded', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:disclosure-aria-expanded',
        message: 'Missing aria-expanded',
        severity: Severity.serious(),
        targetSelector: ElementSelector.fromCss('button.toggle'),
        htmlSnippet: '<button class="toggle"></button>',
      });

      expect(proposals.length).toBeGreaterThanOrEqual(2);
      expect(proposals[0].suggestedAttributes).toEqual({ 'aria-expanded': 'false' });
      expect(proposals[1].suggestedAttributes).toEqual({ 'aria-expanded': 'true' });
    });

    it('should propose fixes for missing aria-controls', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:disclosure-aria-controls',
        message: 'Missing aria-controls',
        severity: Severity.moderate(),
        targetSelector: ElementSelector.fromCss('button.toggle'),
        htmlSnippet: '<button class="toggle"></button>',
      });

      expect(proposals).toHaveLength(1);
      expect(proposals[0].suggestedAttributes).toHaveProperty('aria-controls');
    });
  });

  describe('Verification', () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      patternType: PatternType.disclosure(),
      ruleId: 'pattern:disclosure-keyboard-toggle',
      severity: Severity.serious(),
      message: 'Enter/Space key toggle failed',
      targetSelector: ElementSelector.fromCss('button.accordion-btn'),
      htmlSnippet: '<button class="accordion-btn"></button>',
    });

    it('should pass verification when Enter or Space key was handled', () => {
      const resEnter = pattern.verify(finding, { dispatchedKeys: ['Enter'] });
      expect(resEnter.status.isPassed()).toBe(true);

      const resSpace = pattern.verify(finding, { dispatchedKeys: [' '] });
      expect(resSpace.status.isPassed()).toBe(true);
    });

    it('should fail verification when toggle keys were not handled', () => {
      const res = pattern.verify(finding, { dispatchedKeys: ['Tab'] });
      expect(res.status.isFailed()).toBe(true);
    });
  });
});
