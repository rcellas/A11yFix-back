import { describe, it, expect, beforeEach } from 'vitest';
import { TabsPattern } from '../../../src/domain/pattern/tabs.pattern';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';

describe('TabsPattern (P-02 Plugin)', () => {
  let pattern: TabsPattern;

  beforeEach(() => {
    pattern = new TabsPattern();
  });

  describe('Detection', () => {
    it('should detect role="tablist", "tab", and "tabpanel" with high confidence', () => {
      const resTablist = pattern.detect({
        targetElement: {
          tagName: 'div',
          attributes: { role: 'tablist' },
          outerHtml: '<div role="tablist"></div>',
        },
      });
      expect(resTablist.detected).toBe(true);
      expect(resTablist.confidence).toBe(0.95);

      const resTab = pattern.detect({
        targetElement: {
          tagName: 'button',
          attributes: { role: 'tab' },
          outerHtml: '<button role="tab">Tab 1</button>',
        },
      });
      expect(resTab.detected).toBe(true);
      expect(resTab.confidence).toBe(0.95);

      const resPanel = pattern.detect({
        targetElement: {
          tagName: 'section',
          attributes: { role: 'tabpanel' },
          outerHtml: '<section role="tabpanel"></section>',
        },
      });
      expect(resPanel.detected).toBe(true);
      expect(resPanel.confidence).toBe(0.95);
    });

    it('should detect tab container class heuristics', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'nav',
          attributes: { class: 'tabs-nav' },
          outerHtml: '<nav class="tabs-nav"></nav>',
        },
      });
      expect(result.detected).toBe(true);
      expect(result.confidence).toBe(0.75);
    });

    it('should not detect unrelated elements', () => {
      const result = pattern.detect({
        targetElement: {
          tagName: 'p',
          attributes: {},
          outerHtml: '<p>Some text</p>',
        },
      });
      expect(result.detected).toBe(false);
    });
  });

  describe('Inspection', () => {
    it('should pass inspection for valid accessible tab', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'button',
          attributes: {
            role: 'tab',
            'aria-selected': 'true',
            'aria-controls': 'panel-overview',
          },
          accessibleName: 'Overview',
          outerHtml: '<button role="tab" aria-selected="true" aria-controls="panel-overview">Overview</button>',
        },
      });

      expect(audit.passed).toBe(true);
      expect(audit.violations).toHaveLength(0);
    });

    it('should flag missing aria-selected and aria-controls on tab', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'button',
          attributes: { role: 'tab' },
          outerHtml: '<button role="tab">Tab</button>',
        },
      });

      expect(audit.passed).toBe(false);
      const ruleIds = audit.violations.map((v) => v.ruleId);
      expect(ruleIds).toContain('pattern:tabs-aria-selected');
      expect(ruleIds).toContain('pattern:tabs-aria-controls');
    });

    it('should flag tablist without active tab children', () => {
      const audit = pattern.inspect({
        targetElement: {
          tagName: 'div',
          attributes: { role: 'tablist' },
          outerHtml: '<div role="tablist"></div>',
          children: [
            { tagName: 'button', attributes: { role: 'tab', 'aria-selected': 'false' }, outerHtml: '' },
            { tagName: 'button', attributes: { role: 'tab', 'aria-selected': 'false' }, outerHtml: '' },
          ],
        },
      });

      expect(audit.passed).toBe(false);
      expect(audit.violations[0].ruleId).toBe('pattern:tabs-active-tab-missing');
    });
  });

  describe('Fix Proposals', () => {
    it('should propose fixes for missing aria-selected', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:tabs-aria-selected',
        message: 'Missing aria-selected',
        severity: Severity.serious(),
        targetSelector: ElementSelector.fromCss('button.tab'),
        htmlSnippet: '<button class="tab"></button>',
      });

      expect(proposals.length).toBeGreaterThanOrEqual(2);
      expect(proposals[0].suggestedAttributes).toEqual({ 'aria-selected': 'true' });
      expect(proposals[1].suggestedAttributes).toEqual({ 'aria-selected': 'false' });
    });

    it('should propose fixes for missing aria-controls', () => {
      const proposals = pattern.proposeFix({
        ruleId: 'pattern:tabs-aria-controls',
        message: 'Missing aria-controls',
        severity: Severity.moderate(),
        targetSelector: ElementSelector.fromCss('button.tab'),
        htmlSnippet: '<button class="tab"></button>',
      });

      expect(proposals).toHaveLength(1);
      expect(proposals[0].suggestedAttributes).toHaveProperty('aria-controls');
    });
  });

  describe('Verification', () => {
    const finding = Finding.create({
      auditId: AuditId.create(),
      patternType: PatternType.tabs(),
      ruleId: 'pattern:tabs-keyboard-navigation',
      severity: Severity.serious(),
      message: 'Tab arrow key navigation failed',
      targetSelector: ElementSelector.fromCss('button.tab'),
      htmlSnippet: '<button role="tab"></button>',
    });

    it('should pass verification when ArrowRight was dispatched and handled', () => {
      const res = pattern.verify(finding, { dispatchedKeys: ['ArrowRight'] });
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
