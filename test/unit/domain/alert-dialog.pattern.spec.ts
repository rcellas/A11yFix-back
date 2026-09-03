import { describe, it, expect } from 'vitest';
import { AlertDialogPattern } from '../../../src/domain/pattern/alert-dialog.pattern';
import { DomElementSnapshot } from '../../../src/domain/pattern/pattern-context';

describe('AlertDialogPattern (P-08 WAI-ARIA)', () => {
  const pattern = new AlertDialogPattern();

  it('should detect role="alertdialog"', () => {
    const el: DomElementSnapshot = {
      tagName: 'div',
      attributes: { role: 'alertdialog', id: 'confirm-dialog' },
      outerHtml: '<div role="alertdialog" id="confirm-dialog"></div>',
    };

    const res = pattern.detect({ targetElement: el });
    expect(res.detected).toBe(true);
  });

  it('should inspect and flag missing aria-modal and aria-describedby', () => {
    const el: DomElementSnapshot = {
      tagName: 'div',
      attributes: { role: 'alertdialog', id: 'alert' },
      outerHtml: '<div role="alertdialog" id="alert"></div>',
    };

    const audit = pattern.inspect({ targetElement: el });
    expect(audit.passed).toBe(false);
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:alert-dialog-modal');
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:alert-dialog-describedby');
  });
});
