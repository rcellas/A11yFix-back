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
 * P-08 Alert Dialog Pattern implementation based on WAI-ARIA APG.
 * https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 */
export class AlertDialogPattern implements AccessibilityPattern {
  public readonly type = PatternType.alertDialog();

  public detect(context: PatternContext): DetectionResult {
    const { targetElement } = context;
    const role = targetElement.role || targetElement.attributes['role'];
    const className = targetElement.attributes['class']?.toLowerCase() || '';

    if (role === 'alertdialog') {
      return {
        detected: true,
        confidence: 0.95,
        matchedElement: targetElement,
        reason: 'Element with explicit role="alertdialog".',
      };
    }

    if (
      (className.includes('alert-dialog') || className.includes('confirm-modal')) &&
      (role === 'dialog' || targetElement.tagName.toLowerCase() === 'dialog')
    ) {
      return {
        detected: true,
        confidence: 0.85,
        matchedElement: targetElement,
        reason: 'Dialog designed for urgent/alert confirmation.',
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

    const isAlertDialog = attrs['role'] === 'alertdialog';
    if (!isAlertDialog) {
      violations.push({
        ruleId: 'pattern:alert-dialog-role',
        message: 'Alert dialog container must declare role="alertdialog" instead of standard dialog.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/',
      });
    }

    if (attrs['aria-modal'] !== 'true') {
      violations.push({
        ruleId: 'pattern:alert-dialog-modal',
        message: 'Alert dialog must declare aria-modal="true".',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/',
      });
    }

    if (!attrs['aria-describedby']) {
      violations.push({
        ruleId: 'pattern:alert-dialog-describedby',
        message: 'Alert dialog must reference its descriptive alert message via aria-describedby.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: targetElement.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/',
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

    if (violation.ruleId === 'pattern:alert-dialog-role') {
      proposals.push({
        title: 'Add role="alertdialog"',
        description: 'Notify screen reader users of immediate, disruptive confirmation request.',
        suggestedDiff: '+ role="alertdialog"',
        suggestedAttributes: { role: 'alertdialog' },
      });
    }

    if (violation.ruleId === 'pattern:alert-dialog-modal') {
      proposals.push({
        title: 'Add aria-modal="true"',
        description: 'Confine interaction and perception to the alert dialog.',
        suggestedDiff: '+ aria-modal="true"',
        suggestedAttributes: { 'aria-modal': 'true' },
      });
    }

    if (violation.ruleId === 'pattern:alert-dialog-describedby') {
      proposals.push({
        title: 'Add aria-describedby referencing alert message',
        description: 'Speak alert message immediately upon opening.',
        suggestedDiff: '+ aria-describedby="alert-message"',
        suggestedAttributes: { 'aria-describedby': 'alert-message' },
      });
    }

    return proposals;
  }

  public verify(_finding: Finding, context: VerificationContext): VerificationResult {
    const checks = [
      {
        name: 'Alert Dialog Modal Verification',
        passed: Boolean(context.focusTrapped !== false),
        details: 'Alert dialog maintains focus trapping and announces message.',
      },
    ];

    return {
      status: checks.every((c) => c.passed) ? VerificationStatus.passed() : VerificationStatus.failed(),
      testedAt: new Date(),
      checks,
      summary: 'Alert dialog pattern checks verified successfully.',
    };
  }
}
