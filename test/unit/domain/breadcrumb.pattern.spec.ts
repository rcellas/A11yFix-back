import { describe, it, expect } from 'vitest';
import { BreadcrumbPattern } from '../../../src/domain/pattern/breadcrumb.pattern';
import { DomElementSnapshot } from '../../../src/domain/pattern/pattern-context';

describe('BreadcrumbPattern (P-06 WAI-ARIA)', () => {
  const pattern = new BreadcrumbPattern();

  it('should detect breadcrumb nav landmark', () => {
    const el: DomElementSnapshot = {
      tagName: 'nav',
      attributes: { 'aria-label': 'Breadcrumb', class: 'breadcrumb-nav' },
      outerHtml: '<nav aria-label="Breadcrumb"></nav>',
    };

    const res = pattern.detect({ targetElement: el });
    expect(res.detected).toBe(true);
    expect(res.confidence).toBeGreaterThan(0.9);
  });

  it('should inspect and flag missing aria-current="page"', () => {
    const el: DomElementSnapshot = {
      tagName: 'nav',
      attributes: { 'aria-label': 'Breadcrumb' },
      outerHtml: '<nav aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li>Docs</li></ol></nav>',
    };

    const audit = pattern.inspect({ targetElement: el });
    expect(audit.passed).toBe(false);
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:breadcrumb-current-page');
  });
});
