import { describe, it, expect, vi } from 'vitest';
import { AxeAccessibilityScanner } from '../../../src/infrastructure/accessibility/axe-accessibility-scanner';
import { PlaywrightBrowserInspector } from '../../../src/infrastructure/browser/playwright-browser-inspector';
import { BrowserSession } from '../../../src/application/ports/browser-inspector.port';

describe('AxeAccessibilityScanner', () => {
  it('should map impact levels accurately to domain Severity', () => {
    const scanner = new AxeAccessibilityScanner({} as unknown as PlaywrightBrowserInspector);

    expect(scanner.mapImpactToSeverity('critical').isCritical()).toBe(true);
    expect(scanner.mapImpactToSeverity('serious').isSerious()).toBe(true);
    expect(scanner.mapImpactToSeverity('moderate').isModerate()).toBe(true);
    expect(scanner.mapImpactToSeverity('minor').isMinor()).toBe(true);
    expect(scanner.mapImpactToSeverity(null).isMinor()).toBe(true);
  });

  it('should run scan and format violations into domain contracts', async () => {
    const fakeAxeResults = {
      violations: [
        {
          id: 'color-contrast',
          help: 'Elements must have sufficient color contrast',
          helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
          impact: 'serious',
          nodes: [
            {
              target: ['p.muted-text'],
              html: '<p class="muted-text">Muted text</p>',
              failureSummary: 'Fix any of the following: Element has insufficient color contrast',
            },
          ],
        },
      ],
    };

    const mockPage = {
      evaluate: vi.fn().mockImplementation((fn) => {
        if (typeof fn === 'function') {
          return Promise.resolve(fakeAxeResults);
        }
        return Promise.resolve();
      }),
    };

    const mockInspector = {
      getPage: vi.fn().mockReturnValue(mockPage),
    } as unknown as PlaywrightBrowserInspector;

    const scanner = new AxeAccessibilityScanner(mockInspector);
    const session: BrowserSession = { id: 'test-session-1', url: 'https://example.com' };

    const violations = await scanner.scan(session);

    expect(violations).toHaveLength(1);
    expect(violations[0].ruleId).toBe('axe:color-contrast');
    expect(violations[0].severity.isSerious()).toBe(true);
    expect(violations[0].targetSelector.cssSelector).toBe('p.muted-text');
    expect(violations[0].htmlSnippet).toBe('<p class="muted-text">Muted text</p>');
    expect(violations[0].helpUrl).toBe('https://dequeuniversity.com/rules/axe/4.4/color-contrast');
  });
});
