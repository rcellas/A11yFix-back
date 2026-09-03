import { describe, it, expect } from 'vitest';
import { AccordionPattern } from '../../../src/domain/pattern/accordion.pattern';
import { DomElementSnapshot } from '../../../src/domain/pattern/pattern-context';

describe('AccordionPattern (P-09 WAI-ARIA)', () => {
  const pattern = new AccordionPattern();

  it('should detect accordion elements', () => {
    const el: DomElementSnapshot = {
      tagName: 'div',
      attributes: { class: 'accordion-group', id: 'faq-accordion' },
      outerHtml: '<div class="accordion-group" id="faq-accordion"></div>',
    };

    const res = pattern.detect({ targetElement: el });
    expect(res.detected).toBe(true);
  });

  it('should inspect and flag non-button headers and missing aria-expanded', () => {
    const el: DomElementSnapshot = {
      tagName: 'div',
      attributes: { id: 'header-1' },
      outerHtml: '<div id="header-1">FAQ Item</div>',
    };

    const audit = pattern.inspect({ targetElement: el });
    expect(audit.passed).toBe(false);
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:accordion-header-button');
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:accordion-expanded-state');
  });
});
