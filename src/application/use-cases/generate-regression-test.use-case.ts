import { FindingRepositoryPort } from '../ports/finding-repository.port';
import { AuditRepositoryPort } from '../ports/audit-repository.port';
import { GenerateRegressionTestInput, RegressionTestOutput } from '../dto/regression-test.dto';
import { FindingId } from '../../domain/finding/finding-id';
import { EntityNotFoundError } from '../../domain/errors/domain.error';
import { Finding } from '../../domain/finding/finding';

/**
 * Use case: Generates semantic, standalone Playwright TypeScript regression test code
 * targeting a remediated accessibility finding.
 */
export class GenerateRegressionTestUseCase {
  constructor(
    private readonly findingRepository: FindingRepositoryPort,
    private readonly auditRepository?: AuditRepositoryPort,
  ) {}

  public async execute(input: GenerateRegressionTestInput): Promise<RegressionTestOutput> {
    const findingId = FindingId.fromString(input.findingId);
    const finding = await this.findingRepository.findById(findingId);

    if (!finding) {
      throw new EntityNotFoundError('Finding', input.findingId);
    }

    let targetUrl = 'https://example.com';
    if (this.auditRepository) {
      const audit = await this.auditRepository.findById(finding.auditId);
      if (audit) {
        targetUrl = audit.url.value;
      }
    }

    const testName = this.buildTestName(finding);
    const code = this.buildPlaywrightTestCode(finding, targetUrl);

    return {
      findingId: finding.id.value,
      framework: 'playwright',
      testName,
      code,
    };
  }

  private buildTestName(finding: Finding): string {
    const ruleLabel = finding.ruleId.replace(/^(pattern:|axe:)/, '');
    return `Accessibility Regression: ${ruleLabel} on ${finding.targetSelector.cssSelector}`;
  }

  private buildSemanticLocator(finding: Finding): string {
    const { role, accessibleName, cssSelector } = finding.targetSelector;

    if (role && accessibleName) {
      return `page.getByRole('${role}' as const, { name: '${accessibleName.replace(/'/g, "\\'")}' })`;
    }
    if (role) {
      return `page.getByRole('${role}' as const)`;
    }
    if (accessibleName) {
      return `page.getByLabel('${accessibleName.replace(/'/g, "\\'")}')`;
    }
    return `page.locator('${cssSelector.replace(/'/g, "\\'")}')`;
  }

  private buildPlaywrightTestCode(finding: Finding, url: string): string {
    const semanticLocator = this.buildSemanticLocator(finding);
    const pattern = finding.patternType?.value;

    let testSteps = '';

    if (pattern === 'DIALOG') {
      testSteps = `
    const dialog = ${semanticLocator};
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('role', 'dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    // Verify keyboard escape closes modal
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();`;
    } else if (pattern === 'TABS') {
      testSteps = `
    const tab = ${semanticLocator};
    await expect(tab).toBeVisible();
    await expect(tab).toHaveAttribute('role', 'tab');
    await expect(tab).toHaveAttribute('aria-selected', 'true');

    // Verify arrow key navigation
    await tab.focus();
    await page.keyboard.press('ArrowRight');`;
    } else if (pattern === 'DISCLOSURE') {
      testSteps = `
    const trigger = ${semanticLocator};
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute('aria-expanded', /true|false/);

    // Verify toggle interaction
    await trigger.click();
    await expect(trigger).toHaveAttribute('aria-expanded', 'true');`;
    } else if (pattern === 'COMBOBOX') {
      testSteps = `
    const combobox = ${semanticLocator};
    await expect(combobox).toBeVisible();
    await expect(combobox).toHaveAttribute('role', 'combobox');

    // Verify keyboard activation
    await combobox.focus();
    await page.keyboard.press('ArrowDown');
    await expect(combobox).toHaveAttribute('aria-expanded', 'true');`;
    } else {
      // General axe finding regression check
      testSteps = `
    const element = ${semanticLocator};
    await expect(element).toBeVisible();
    // Rule verification: ${finding.ruleId}
    // ${finding.message.replace(/\n/g, '\n    // ')}`;
    }

    return `import { test, expect } from '@playwright/test';

test.describe('A11yFix Automated Regression Suite', () => {
  test('${this.buildTestName(finding)}', async ({ page }) => {
    await page.goto('${url}', { waitUntil: 'domcontentloaded' });
${testSteps}
  });
});
`;
  }
}
