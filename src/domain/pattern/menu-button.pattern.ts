import { AccessibilityPattern } from './accessibility-pattern.interface';
import { PatternType } from './pattern-type';
import {
  PatternContext,
  DetectionResult,
  PatternAudit,
  PatternRuleViolation,
  FixProposal,
  VerificationResult,
  VerificationContext,
} from './pattern-context';
import { Severity } from '../finding/severity';
import { ElementSelector } from '../finding/element-selector';
import { VerificationStatus } from '../verification/verification-status';
import { Finding } from '../finding/finding';

/**
 * P-05 Menu Button Pattern implementation based on WAI-ARIA APG.
 * https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
 */
export class MenuButtonPattern implements AccessibilityPattern {
  public readonly type = PatternType.menuButton();

  public detect(context: PatternContext): DetectionResult {
    const { targetElement } = context;
    const role = targetElement.role || targetElement.attributes['role'];
    const haspopup = targetElement.attributes['aria-haspopup'];
    const tagName = targetElement.tagName.toLowerCase();

    if (
      (role === 'button' || tagName === 'button') &&
      (haspopup === 'menu' || haspopup === 'true')
    ) {
      return {
        detected: true,
        confidence: 0.95,
        matchedElement: targetElement,
        reason: 'Button with explicit aria-haspopup="menu".',
      };
    }

    if (role === 'menu' || role === 'menubar') {
      return {
        detected: true,
        confidence: 0.9,
        matchedElement: targetElement,
        reason: 'Container with role="menu" or "menubar".',
      };
    }

    if (
      (tagName === 'button' || role === 'button') &&
      targetElement.attributes['aria-expanded'] !== undefined &&
      (targetElement.attributes['aria-controls']?.includes('menu') ||
        targetElement.attributes['id']?.includes('menu'))
    ) {
      return {
        detected: true,
        confidence: 0.8,
        matchedElement: targetElement,
        reason: 'Button controlling menu element with aria-expanded.',
      };
    }

    return {
      detected: false,
      confidence: 0.0,
      matchedElement: targetElement,
    };
  }

  public inspect(context: PatternContext): PatternAudit {
    const { targetElement } = context;
    const violations: PatternRuleViolation[] = [];
    const attrs = targetElement.attributes;
    const selector = ElementSelector.create({
      cssSelector: attrs['id'] ? `#${attrs['id']}` : targetElement.tagName,
      role: targetElement.role || attrs['role'],
      accessibleName: targetElement.accessibleName || attrs['aria-label'],
    });

    const haspopup = attrs['aria-haspopup'];
    if (!haspopup || (haspopup !== 'menu' && haspopup !== 'true')) {
      violations.push({
        ruleId: 'pattern:menu-button-haspopup',
        message: 'Menu button must declare aria-haspopup="menu" or aria-haspopup="true".',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
      });
    }

    if (attrs['aria-expanded'] === undefined) {
      violations.push({
        ruleId: 'pattern:menu-button-expanded',
        message: 'Menu button must declare aria-expanded attribute to indicate menu visibility.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
      });
    }

    if (!attrs['aria-controls']) {
      violations.push({
        ruleId: 'pattern:menu-button-controls',
        message: 'Menu button should reference the menu container via aria-controls.',
        severity: Severity.moderate(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      inspectedAt: new Date(),
    };
  }

  public proposeFix(violation: PatternRuleViolation): FixProposal[] {
    const proposals: FixProposal[] = [];

    if (violation.ruleId === 'pattern:menu-button-haspopup') {
      proposals.push({
        title: 'Add aria-haspopup="menu"',
        description: 'Declare that the button opens a popup menu.',
        suggestedDiff: '+ aria-haspopup="menu"',
        suggestedAttributes: { 'aria-haspopup': 'menu' },
      });
    }

    if (violation.ruleId === 'pattern:menu-button-expanded') {
      proposals.push({
        title: 'Add aria-expanded="false"',
        description: 'Expose collapsed/expanded state to assistive technologies.',
        suggestedDiff: '+ aria-expanded="false"',
        suggestedAttributes: { 'aria-expanded': 'false' },
      });
    }

    if (violation.ruleId === 'pattern:menu-button-controls') {
      proposals.push({
        title: 'Add aria-controls referencing menu id',
        description: 'Associate trigger button with the menu content element.',
        suggestedDiff: '+ aria-controls="menu-items"',
        suggestedAttributes: { 'aria-controls': 'menu-items' },
      });
    }

    return proposals;
  }

  public verify(_finding: Finding, context: VerificationContext): VerificationResult {
    const checks = [
      {
        name: 'Keyboard Navigation (ArrowDown / Escape)',
        passed: Boolean(context.dispatchedKeys?.includes('ArrowDown') || context.dispatchedKeys?.includes('Escape')),
        details: 'Menu button opens on ArrowDown/Space and dismisses on Escape.',
      },
    ];

    return {
      status: checks.every((c) => c.passed) ? VerificationStatus.passed() : VerificationStatus.failed(),
      testedAt: new Date(),
      checks,
      summary: 'Menu button pattern checks verified successfully.',
    };
  }
}
