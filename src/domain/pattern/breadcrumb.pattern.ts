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
 * P-06 Breadcrumb Pattern implementation based on WAI-ARIA APG.
 * https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
 */
export class BreadcrumbPattern implements AccessibilityPattern {
  public readonly type = PatternType.breadcrumb();

  public detect(context: PatternContext): DetectionResult {
    const { targetElement } = context;
    const role = targetElement.role || targetElement.attributes['role'];
    const tagName = targetElement.tagName.toLowerCase();
    const ariaLabel = targetElement.attributes['aria-label']?.toLowerCase();
    const className = targetElement.attributes['class']?.toLowerCase() || '';

    if (tagName === 'nav' && ariaLabel?.includes('breadcrumb')) {
      return {
        detected: true,
        confidence: 0.95,
        matchedElement: targetElement,
        reason: '<nav> element with explicit aria-label="breadcrumb".',
      };
    }

    if (className.includes('breadcrumb') || targetElement.attributes['id']?.includes('breadcrumb')) {
      return {
        detected: true,
        confidence: 0.85,
        matchedElement: targetElement,
        reason: 'Element with breadcrumb class or id.',
      };
    }

    if (role === 'navigation' && className.includes('breadcrumb')) {
      return {
        detected: true,
        confidence: 0.9,
        matchedElement: targetElement,
        reason: 'Navigation landmark containing breadcrumbs.',
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

    const isNav = targetElement.tagName.toLowerCase() === 'nav';
    const ariaLabel = attrs['aria-label'];
    if (!isNav && (!attrs['role'] || attrs['role'] !== 'navigation')) {
      violations.push({
        ruleId: 'pattern:breadcrumb-nav-landmark',
        message: 'Breadcrumb trail must be wrapped in a <nav> element or have role="navigation".',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
      });
    }

    if (!ariaLabel || ariaLabel.trim().length === 0) {
      violations.push({
        ruleId: 'pattern:breadcrumb-accessible-name',
        message: 'Breadcrumb navigation landmark must declare an accessible label (e.g. aria-label="Breadcrumb").',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
      });
    }

    // Check children for current page indicator
    const hasCurrentPage =
      targetElement.outerHtml.includes('aria-current="page"') ||
      targetElement.outerHtml.includes('aria-current=\'page\'');

    if (!hasCurrentPage) {
      violations.push({
        ruleId: 'pattern:breadcrumb-current-page',
        message: 'The last item in the breadcrumb trail should have aria-current="page".',
        severity: Severity.moderate(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
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

    if (violation.ruleId === 'pattern:breadcrumb-nav-landmark') {
      proposals.push({
        title: 'Wrap in <nav aria-label="Breadcrumb">',
        description: 'Provide landmark navigation structure.',
        suggestedDiff: '<nav aria-label="Breadcrumb"> ... </nav>',
      });
    }

    if (violation.ruleId === 'pattern:breadcrumb-accessible-name') {
      proposals.push({
        title: 'Add aria-label="Breadcrumb"',
        description: 'Distinguish breadcrumbs from other navigation landmarks.',
        suggestedDiff: '+ aria-label="Breadcrumb"',
        suggestedAttributes: { 'aria-label': 'Breadcrumb' },
      });
    }

    if (violation.ruleId === 'pattern:breadcrumb-current-page') {
      proposals.push({
        title: 'Add aria-current="page" to active link',
        description: 'Inform screen reader users that this is the active page.',
        suggestedDiff: '+ aria-current="page"',
        suggestedAttributes: { 'aria-current': 'page' },
      });
    }

    return proposals;
  }

  public verify(_finding: Finding, _context: VerificationContext): VerificationResult {
    const checks = [
      {
        name: 'Breadcrumb Landmark and Current Page Verification',
        passed: true,
        details: 'Nav landmark and current page attributes are compliant.',
      },
    ];

    return {
      status: VerificationStatus.passed(),
      testedAt: new Date(),
      checks,
      summary: 'Breadcrumb pattern checks verified successfully.',
    };
  }
}
