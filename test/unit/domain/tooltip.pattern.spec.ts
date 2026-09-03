import { describe, it, expect } from 'vitest';
import { TooltipPattern } from '../../../src/domain/pattern/tooltip.pattern';
import { DomElementSnapshot } from '../../../src/domain/pattern/pattern-context';

describe('TooltipPattern (P-07 WAI-ARIA)', () => {
  const pattern = new TooltipPattern();

  it('should detect element with role="tooltip"', () => {
    const el: DomElementSnapshot = {
      tagName: 'div',
      attributes: { role: 'tooltip', id: 'tp-1' },
      outerHtml: '<div role="tooltip" id="tp-1">Details</div>',
    };

    const res = pattern.detect({ targetElement: el });
    expect(res.detected).toBe(true);
  });

  it('should inspect and flag missing aria-describedby on interactive trigger', () => {
    const el: DomElementSnapshot = {
      tagName: 'button',
      attributes: { id: 'btn-1' },
      outerHtml: '<button id="btn-1">Save</button>',
    };

    const audit = pattern.inspect({ targetElement: el });
    expect(audit.passed).toBe(false);
    expect(audit.violations.map((v) => v.ruleId)).toContain('pattern:tooltip-describedby');
  });
});
