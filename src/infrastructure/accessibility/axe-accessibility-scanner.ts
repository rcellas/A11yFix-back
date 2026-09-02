import axe from 'axe-core';
import {
  AccessibilityScannerPort,
  RawScanViolation,
} from '../../application/ports/accessibility-scanner.port';
import { BrowserSession } from '../../application/ports/browser-inspector.port';
import { PlaywrightBrowserInspector } from '../browser/playwright-browser-inspector';
import { Severity } from '../../domain/finding/severity';
import { ElementSelector } from '../../domain/finding/element-selector';

/**
 * axe-core adapter implementing AccessibilityScannerPort.
 * Isolated in infrastructure layer.
 */
export class AxeAccessibilityScanner implements AccessibilityScannerPort {
  constructor(private readonly browserInspector: PlaywrightBrowserInspector) {}

  public async scan(session: BrowserSession): Promise<RawScanViolation[]> {
    const page = this.browserInspector.getPage(session);

    // Inject axe-core script content into the active browser page
    await page.evaluate(axe.source);

    // Run axe evaluation inside the browser
    const results = await page.evaluate(async () => {
      // @ts-expect-error axe is injected globally into page window
      return window.axe.run(document, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
        },
      });
    });

    const rawViolations: RawScanViolation[] = [];

    for (const v of results.violations) {
      const severity = this.mapImpactToSeverity(v.impact);

      for (const node of v.nodes) {
        const targetCss = Array.isArray(node.target) ? node.target.join(' ') : String(node.target);

        rawViolations.push({
          ruleId: `axe:${v.id}`,
          message: `${v.help}. ${node.failureSummary ?? ''}`.trim(),
          severity,
          helpUrl: v.helpUrl,
          targetSelector: ElementSelector.create({
            cssSelector: targetCss || 'unknown',
            xpath: node.xpath?.[0],
          }),
          htmlSnippet: node.html ?? '',
        });
      }
    }

    return rawViolations;
  }

  public mapImpactToSeverity(impact?: string | null): Severity {
    switch (impact?.toLowerCase()) {
      case 'critical':
        return Severity.critical();
      case 'serious':
        return Severity.serious();
      case 'moderate':
        return Severity.moderate();
      case 'minor':
      default:
        return Severity.minor();
    }
  }
}
