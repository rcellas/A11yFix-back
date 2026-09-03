import { describe, it, expect } from 'vitest';
import { MenuButtonPattern } from '../../../src/domain/pattern/menu-button.pattern';
import { DomElementSnapshot } from '../../../src/domain/pattern/pattern-context';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';

describe('MenuButtonPattern (P-05 WAI-ARIA)', () => {
  const pattern = new MenuButtonPattern();

  it('should detect button with aria-haspopup="menu"', () => {
    const el: DomElementSnapshot = {
      tagName: 'button',
      attributes: { 'aria-haspopup': 'menu', 'aria-expanded': 'false', id: 'actions-btn' },
      outerHtml: '<button aria-haspopup="menu" id="actions-btn">Actions</button>',
    };

    const res = pattern.detect({ targetElement: el });
    expect(res.detected).toBe(true);
    expect(res.confidence).toBeGreaterThan(0.9);
  });

  it('should inspect and flag missing aria-expanded and aria-controls', () => {
    const el: DomElementSnapshot = {
      tagName: 'button',
      attributes: { 'aria-haspopup': 'menu', id: 'menu-btn' },
      outerHtml: '<button aria-haspopup="menu" id="menu-btn">Menu</button>',
    };

    const audit = pattern.inspect({ targetElement: el });
    expect(audit.passed).toBe(false);
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:menu-button-expanded');
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:menu-button-controls');
  });

  it('should propose fixes for missing attributes', () => {
    const proposals = pattern.proposeFix({
      ruleId: 'pattern:menu-button-expanded',
      message: 'Missing expanded',
      severity: Severity.serious(),
      targetSelector: ElementSelector.fromCss('button'),
      htmlSnippet: '<button></button>',
    });

    expect(proposals).toHaveLength(1);
    expect(proposals[0].suggestedAttributes).toEqual({ 'aria-expanded': 'false' });
  });

  it('should verify keyboard navigation', () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      ruleId: 'pattern:menu-button-expanded',
      severity: Severity.serious(),
      message: 'test',
      targetSelector: ElementSelector.fromCss('button'),
      htmlSnippet: '<button></button>',
    });

    const result = pattern.verify(finding, { dispatchedKeys: ['ArrowDown'] });
    expect(result.status.isPassed()).toBe(true);
  });
});
