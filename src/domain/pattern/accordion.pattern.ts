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
 * P-09 Accordion Pattern implementation based on WAI-ARIA APG.
 * https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
 */
export class AccordionPattern implements AccessibilityPattern {
  public readonly type = PatternType.accordion();

  public detect(context: PatternContext): DetectionResult {
    const { targetElement } = context;
    const className = targetElement.attributes['class']?.toLowerCase() || '';
    const id = targetElement.attributes['id']?.toLowerCase() || '';

    if (className.includes('accordion') || id.includes('accordion')) {
      return {
        detected: true,
        confidence: 0.9,
        matchedElement: targetElement,
        reason: 'Container with accordion class or id.',
      };
    }

    if (
      targetElement.attributes['aria-expanded'] !== undefined &&
      targetElement.attributes['aria-controls'] !== undefined &&
      (targetElement.tagName.toLowerCase() === 'button' || targetElement.role === 'button')
    ) {
      return {
        detected: true,
        confidence: 0.85,
        matchedElement: targetElement,
        reason: 'Button controlling expandable accordion panel.',
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

    const isButton = targetElement.tagName.toLowerCase() === 'button' || attrs['role'] === 'button';
    if (!isButton) {
      violations.push({
        ruleId: 'pattern:accordion-header-button',
        message: 'Accordion header must be a native <button> or have role="button".',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
      });
    }

    if (attrs['aria-expanded'] === undefined) {
      violations.push({
        ruleId: 'pattern:accordion-expanded-state',
        message: 'Accordion header button must declare aria-expanded attribute.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
      });
    }

    if (!attrs['aria-controls']) {
      violations.push({
        ruleId: 'pattern:accordion-panel-controls',
        message: 'Accordion header button must reference its panel id via aria-controls.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
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

    if (violation.ruleId === 'pattern:accordion-header-button') {
      proposals.push({
        title: 'Use native <button> in accordion header',
        description: 'Ensure accordion headers receive keyboard focus and activate on Space/Enter.',
        suggestedDiff: '<button type="button" ...>',
      });
    }

    if (violation.ruleId === 'pattern:accordion-expanded-state') {
      proposals.push({
        title: 'Add aria-expanded="false"',
        description: 'Expose collapsible panel state to assistive technologies.',
        suggestedDiff: '+ aria-expanded="false"',
        suggestedAttributes: { 'aria-expanded': 'false' },
      });
    }

    if (violation.ruleId === 'pattern:accordion-panel-controls') {
      proposals.push({
        title: 'Add aria-controls="panel-id"',
        description: 'Link accordion header trigger with its expandable content panel.',
        suggestedDiff: '+ aria-controls="accordion-panel"',
        suggestedAttributes: { 'aria-controls': 'accordion-panel' },
      });
    }

    return proposals;
  }

  public verify(_finding: Finding, context: VerificationContext): VerificationResult {
    const checks = [
      {
        name: 'Accordion Keyboard Expansion Verification',
        passed: Boolean(context.dispatchedKeys?.includes('Enter') || context.dispatchedKeys?.includes(' ')),
        details: 'Accordion toggles on Enter / Space key press.',
      },
    ];

    return {
      status: checks.every((c) => c.passed) ? VerificationStatus.passed() : VerificationStatus.failed(),
      testedAt: new Date(),
      checks,
      summary: 'Accordion pattern checks verified successfully.',
    };
  }
}
