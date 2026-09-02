import { describe, it, expect, beforeEach } from 'vitest';
import { ComboboxPattern } from '../../../src/domain/pattern/combobox.pattern';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';

describe('ComboboxPattern (P-04 Plugin)', () => {
  let pattern: ComboboxPattern;

  beforeEach(() => {
    pattern = new ComboboxPattern();
  });

  describe('Detection', () => {
    it('should detect role="combobox" with confidence 0.95', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'input',
          attributes: { role: 'combobox' },
          outerHtml: '<input role="combobox" />',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.95);
    });

    it('should detect native <input list="..."> with confidence 0.9', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'input',
          attributes: { list: 'languages' },
          outerHtml: '<input list="languages" />',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.9);
    });

    it('should detect autocomplete class heuristics', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'div',
          attributes: { class: 'select-search-container' },
          outerHtml: '<div class="select-search-container"></div>',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.75);
    });

    it('should reject non-combobox elements', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'textarea',
          attributes: {},
          outerHtml: '<textarea></textarea>',
        },
      });

      expect(result.detected).toBe(false);
    });
  });

  describe('Inspection', () => {
    it('should pass inspection for valid accessible combobox', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'input',
          attributes: {
            role: 'combobox',
            'aria-expanded': 'false',
            'aria-haspopup': 'listbox',
            'aria-controls': 'combo-listbox',
            'aria-label': 'Select country',
          },
          accessibleName: 'Select country',
          outerHtml: '<input role="combobox" aria-expanded="false" aria-haspopup="listbox" aria-controls="combo-listbox" />',
        },
      });

      expect(audit.passed).toBe(true);
      expect(audit.violations).toHaveLength(0);
    });

    it('should flag missing role, aria-expanded, aria-haspopup, and aria-controls', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'input',
          attributes: { type: 'text' },
          outerHtml: '<input type="text" />',
        },
      });

      expect(audit.passed).toBe(false);
      const ruleIds = audit.violations.map((v) => v.ruleId);
      expect(ruleIds).toContain('pattern:combobox-role');
      expect(ruleIds).toContain('pattern:combobox-aria-expanded');
      expect(ruleIds).toContain('pattern:combobox-aria-haspopup');
      expect(ruleIds).toContain('pattern:combobox-aria-controls');
    });
  });

  describe('Fix Proposals', () => {
    it('should propose fixes for missing role="combobox"', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:combobox-role',
        message: 'Missing combobox role',
        severity: Severity.critical(),
        targetSelector: ElementSelector.fromCss('input.autocomplete'),
        htmlSnippet: '<input />',
      });

      expect(proposals).toHaveLength(1);
      expect(proposals[0].suggestedAttributes).toEqual({ role: 'combobox' });
    });

    it('should propose fixes for missing aria-expanded', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:combobox-aria-expanded',
        message: 'Missing aria-expanded',
        severity: Severity.serious(),
        targetSelector: ElementSelector.fromCss('input.autocomplete'),
        htmlSnippet: '<input />',
      });

      expect(proposals.length).toBeGreaterThanOrEqual(2);
      expect(proposals[0].suggestedAttributes).toEqual({ 'aria-expanded': 'false' });
    });

    it('should propose fixes for missing aria-haspopup="listbox"', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:combobox-aria-haspopup',
        message: 'Missing aria-haspopup',
        severity: Severity.moderate(),
        targetSelector: ElementSelector.fromCss('input.autocomplete'),
        htmlSnippet: '<input />',
      });

      expect(proposals).toHaveLength(1);
      expect(proposals[0].suggestedAttributes).toEqual({ 'aria-haspopup': 'listbox' });
    });
  });

  describe('Verification', () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      patternType: PatternType.combobox(),
      ruleId: 'pattern:combobox-keyboard-navigation',
      severity: Severity.serious(),
      message: 'Combobox arrow navigation failed',
      targetSelector: ElementSelector.fromCss('input.combobox'),
      htmlSnippet: '<input role="combobox" />',
    });

    it('should pass verification when ArrowDown was handled', () => {
      const res = pattern.verify(finding, { dispatchedKeys: ['ArrowDown'] });
      expect(res.status.isPassed()).toBe(true);
      expect(res.checks[0].passed).toBe(true);
    });

    it('should fail verification when arrow keys were not handled', () => {
      const res = pattern.verify(finding, { dispatchedKeys: ['Tab'] });
      expect(res.status.isFailed()).toBe(true);
      expect(res.checks[0].passed).toBe(false);
    });
  });
});
