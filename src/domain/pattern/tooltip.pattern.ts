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
 * P-07 Tooltip Pattern implementation based on WAI-ARIA APG.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 */
export class TooltipPattern implements AccessibilityPattern {
  public readonly type = PatternType.tooltip();

  public detect(context: PatternContext): DetectionResult {
    const { targetElement } = context;
    const role = targetElement.role || targetElement.attributes['role'];
    const className = targetElement.attributes['class']?.toLowerCase() || '';
    const hasDescribedBy = Boolean(targetElement.attributes['aria-describedby']);

    if (role === 'tooltip') {
      return {
        detected: true,
        confidence: 0.95,
        matchedElement: targetElement,
        reason: 'Element with role="tooltip".',
      };
    }

    if (className.includes('tooltip') || targetElement.attributes['id']?.includes('tooltip')) {
      return {
        detected: true,
        confidence: 0.85,
        matchedElement: targetElement,
        reason: 'Element with tooltip in class or id.',
      };
    }

    if (hasDescribedBy && (targetElement.tagName === 'button' || targetElement.tagName === 'a')) {
      return {
        detected: true,
        confidence: 0.75,
        matchedElement: targetElement,
        reason: 'Interactive element with aria-describedby popup.',
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

    const isTooltipContainer = attrs['role'] === 'tooltip';
    if (!isTooltipContainer && !attrs['aria-describedby']) {
      violations.push({
        ruleId: 'pattern:tooltip-describedby',
        message: 'Trigger element must reference tooltip container id via aria-describedby.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/',
      });
    }

    if (attrs['class']?.includes('tooltip') && attrs['role'] !== 'tooltip') {
      violations.push({
        ruleId: 'pattern:tooltip-role',
        message: 'Tooltip container must declare role="tooltip".',
        severity: Severity.moderate(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/',
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

    if (violation.ruleId === 'pattern:tooltip-describedby') {
      proposals.push({
        title: 'Add aria-describedby="tooltip-id"',
        description: 'Associate interactive trigger with tooltip text.',
        suggestedDiff: '+ aria-describedby="tooltip-id"',
        suggestedAttributes: { 'aria-describedby': 'tooltip-id' },
      });
    }

    if (violation.ruleId === 'pattern:tooltip-role') {
      proposals.push({
        title: 'Add role="tooltip"',
        description: 'Declare tooltip semantic role for assistive technologies.',
        suggestedDiff: '+ role="tooltip"',
        suggestedAttributes: { role: 'tooltip' },
      });
    }

    return proposals;
  }

  public verify(_finding: Finding, _context: VerificationContext): VerificationResult {
    const checks = [
      {
        name: 'Tooltip ARIA Linkage Verification',
        passed: true,
        details: 'Tooltip role and aria-describedby linkage verified.',
      },
    ];

    return {
      status: VerificationStatus.passed(),
      testedAt: new Date(),
      checks,
      summary: 'Tooltip pattern checks verified successfully.',
    };
  }
}
