import { describe, it, expect, beforeEach } from 'vitest';
import { DialogPattern } from '../../../src/domain/pattern/dialog.pattern';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';

describe('DialogPattern (P-01 Plugin)', () => {
  let pattern: DialogPattern;

  beforeEach(() => {
    pattern = new DialogPattern();
  });

  describe('Detection', () => {
    it('should detect native <dialog> with highest confidence', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'dialog',
          attributes: { role: 'dialog' },
          outerHtml: '<dialog role="dialog"></dialog>',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(1.0);
    });

    it('should detect element with role="dialog" or "alertdialog"', () => {
      const resDialog = pattern.detect({
        targetElement: {
          tagName: 'div',
          attributes: { role: 'dialog' },
          outerHtml: '<div role="dialog"></div>',
        },
      });
      expect(resDialog.detected).toBe(true);
      expect(resDialog.confidence).toBe(0.95);

      const resAlert = pattern.detect({
        targetElement: {
          tagName: 'div',
          attributes: { role: 'alertdialog' },
          outerHtml: '<div role="alertdialog"></div>',
        },
      });
      expect(resAlert.detected).toBe(true);
      expect(resAlert.confidence).toBe(0.95);
    });

    it('should detect modal class heuristics with medium confidence', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'div',
          attributes: { class: 'modal-overlay open' },
          outerHtml: '<div class="modal-overlay open"></div>',
        },
      });

      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.7);
    });

    it('should not detect unrelated elements', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'button',
          attributes: { id: 'btn' },
          outerHtml: '<button id="btn">Click me</button>',
        },
      });

      expect(result.detected).toBe(false);
      expect(result.confidence).toBe(0);
    });
  });

  describe('Inspection', () => {
    it('should pass inspection for fully accessible dialog', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'div',
          attributes: {
            role: 'dialog',
            'aria-labelledby': 'heading-1',
            'aria-modal': 'true',
          },
          accessibleName: 'Cookie Consent',
          outerHtml: '<div role="dialog" aria-labelledby="heading-1" aria-modal="true"></div>',
        },
      });

      expect(audit.passed).toBe(true);
      expect(audit.violations).toHaveLength(0);
    });

    it('should flag missing role, missing name, and missing aria-modal', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'div',
          attributes: { class: 'modal' },
          outerHtml: '<div class="modal"></div>',
        },
      });

      expect(audit.passed).toBe(false);
      const ruleIds = audit.violations.map((v) => v.ruleId);
      expect(ruleIds).toContain('pattern:dialog-role');
      expect(ruleIds).toContain('pattern:dialog-accessible-name');
      expect(ruleIds).toContain('pattern:dialog-modal-attribute');
    });
  });

  describe('Fix Proposals', () => {
    it('should propose fixes for missing accessible name', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:dialog-accessible-name',
        message: 'Missing accessible name',
        severity: Severity.serious(),
        targetSelector: ElementSelector.fromCss('#modal'),
        htmlSnippet: '<div></div>',
      });

      expect(proposals.length).toBeGreaterThanOrEqual(2);
      expect(proposals[0].suggestedAttributes).toHaveProperty('aria-labelledby');
      expect(proposals[1].suggestedAttributes).toHaveProperty('aria-label');
    });

    it('should propose fixes for missing aria-modal="true"', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:dialog-modal-attribute',
        message: 'Missing aria-modal',
        severity: Severity.moderate(),
        targetSelector: ElementSelector.fromCss('#modal'),
        htmlSnippet: '<div></div>',
      });

      expect(proposals).toHaveLength(1);
      expect(proposals[0].suggestedAttributes).toEqual({ 'aria-modal': 'true' });
    });
  });

  describe('Verification', () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-focus-trap',
      severity: Severity.critical(),
      message: 'Focus trap failed',
      targetSelector: ElementSelector.fromCss('#modal'),
      htmlSnippet: '<div role="dialog"></div>',
    });

    it('should pass verification when focusTrapped is confirmed', () => {
      const res = pattern.verify(finding, { focusTrapped: true });
      expect(res.status.isPassed()).toBe(true);
      expect(res.checks[0].passed).toBe(true);
    });

    it('should fail verification when focus escaped dialog', () => {
      const res = pattern.verify(finding, { focusTrapped: false });
      expect(res.status.isFailed()).toBe(true);
      expect(res.checks[0].passed).toBe(false);
    });

    it('should verify escape dismissal when Escape key was handled', () => {
      const escapeFinding = Finding.create({
        auditId: AuditId.create(),
        patternType: PatternType.dialog(),
        ruleId: 'pattern:dialog-escape-dismiss',
        severity: Severity.serious(),
        message: 'Escape dismiss failed',
        targetSelector: ElementSelector.fromCss('#modal'),
        htmlSnippet: '<div role="dialog"></div>',
      });

      const passRes = pattern.verify(escapeFinding, { dispatchedKeys: ['Escape'] });
      expect(passRes.status.isPassed()).toBe(true);

      const failRes = pattern.verify(escapeFinding, { dispatchedKeys: ['Enter'] });
      expect(failRes.status.isFailed()).toBe(true);
    });
  });
});
