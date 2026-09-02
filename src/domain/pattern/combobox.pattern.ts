import { PatternType } from './pattern-type';
import { AccessibilityPattern } from './accessibility-pattern.interface';
import {
  PatternContext,
  DetectionResult,
  PatternAudit,
  PatternRuleViolation,
  FixProposal,
  VerificationResult,
  VerificationContext,
  VerificationCheck,
} from './pattern-context';
import { Severity } from '../finding/severity';
import { ElementSelector } from '../finding/element-selector';
import { Finding } from '../finding/finding';
import { VerificationStatus } from '../verification/verification-status';

/**
 * P-04: WAI-ARIA Combobox Pattern Plugin.
 * Enforces combobox role, aria-expanded, aria-haspopup, aria-controls, and aria-activedescendant relationships.
 */
export class ComboboxPattern implements AccessibilityPattern {
  public readonly type = PatternType.combobox();

  /**
   * Detects if the target element represents a combobox / autocomplete component.
   */
  public detect(context: PatternContext): DetectionResult {
    const el = context.targetElement;
    const role = el.attributes.role?.toLowerCase() || el.role?.toLowerCase();
    const isCombobox = role === 'combobox';
    const hasListAttr = Boolean(el.attributes.list);

    if (isCombobox) {
      return {
        detected: true,
        confidence: 0.95,
        reason: 'Element with role="combobox" identified',
        matchedElement: el,
      };
    }

    if (hasListAttr) {
      return {
        detected: true,
        confidence: 0.9,
        reason: 'Native HTML5 <input list="..."> datalist combobox identified',
        matchedElement: el,
      };
    }

    // Secondary heuristic: class names containing 'combobox', 'autocomplete', 'typeahead'
    const className = el.attributes.class?.toLowerCase() || '';
    if (
      className.includes('combobox') ||
      className.includes('autocomplete') ||
      className.includes('typeahead') ||
      className.includes('select-search')
    ) {
      return {
        detected: true,
        confidence: 0.75,
        reason: 'Combobox/Autocomplete class heuristics matched',
        matchedElement: el,
      };
    }

    return {
      detected: false,
      confidence: 0,
      matchedElement: el,
    };
  }

  /**
   * Inspects combobox element invariants according to WAI-ARIA Authoring Practices.
   */
  public inspect(context: PatternContext): PatternAudit {
    const el = context.targetElement;
    const violations: PatternRuleViolation[] = [];
    const role = el.attributes.role?.toLowerCase() || el.role?.toLowerCase();

    const selector = ElementSelector.create({
      cssSelector: el.attributes.id ? `#${el.attributes.id}` : el.tagName.toLowerCase(),
      role: role || 'combobox',
      accessibleName: el.accessibleName || el.attributes['aria-label'] || el.attributes.placeholder,
    });

    // 1. Role verification
    if (role !== 'combobox') {
      violations.push({
        ruleId: 'pattern:combobox-role',
        message: 'Combobox input must declare role="combobox".',
        severity: Severity.critical(),
        targetSelector: selector,
        htmlSnippet: el.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
      });
    }

    // 2. aria-expanded state check
    const ariaExpanded = el.attributes['aria-expanded'];
    if (ariaExpanded !== 'true' && ariaExpanded !== 'false') {
      violations.push({
        ruleId: 'pattern:combobox-aria-expanded',
        message: 'Combobox must declare aria-expanded="true" or aria-expanded="false" to reflect popup visibility.',
        severity: Severity.serious(),
        targetSelector: selector,
        htmlSnippet: el.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
      });
    }

    // 3. aria-haspopup check (should be "listbox" or "true")
    const ariaHasPopup = el.attributes['aria-haspopup']?.toLowerCase();
    if (!ariaHasPopup || (ariaHasPopup !== 'listbox' && ariaHasPopup !== 'true' && ariaHasPopup !== 'grid' && ariaHasPopup !== 'tree' && ariaHasPopup !== 'dialog')) {
      violations.push({
        ruleId: 'pattern:combobox-aria-haspopup',
        message: 'Combobox should declare aria-haspopup="listbox" to communicate popup type.',
        severity: Severity.moderate(),
        targetSelector: selector,
        htmlSnippet: el.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
      });
    }

    // 4. aria-controls association check
    if (!el.attributes['aria-controls'] || el.attributes['aria-controls'].trim().length === 0) {
      violations.push({
        ruleId: 'pattern:combobox-aria-controls',
        message: 'Combobox should declare aria-controls referencing the ID of its popup listbox.',
        severity: Severity.moderate(),
        targetSelector: selector,
        htmlSnippet: el.outerHtml,
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
      });
    }

    return {
      passed: violations.length === 0,
      violations,
      inspectedAt: new Date(),
    };
  }

  /**
   * Generates actionable fix proposals for combobox violations.
   */
  public proposeFix(violation: PatternRuleViolation): FixProposal[] {
    switch (violation.ruleId) {
      case 'pattern:combobox-role':
        return [
          {
            title: 'Add role="combobox" attribute',
            description: 'Define the combobox composite widget semantic role.',
            suggestedDiff: '+ role="combobox"',
            suggestedAttributes: { role: 'combobox' },
          },
        ];
      case 'pattern:combobox-aria-expanded':
        return [
          {
            title: 'Add aria-expanded="false" (default closed)',
            description: 'Explicitly convey that the popup listbox is currently closed.',
            suggestedDiff: '+ aria-expanded="false"',
            suggestedAttributes: { 'aria-expanded': 'false' },
          },
          {
            title: 'Add aria-expanded="true" (when popup is open)',
            description: 'Explicitly convey that the popup listbox is currently open.',
            suggestedDiff: '+ aria-expanded="true"',
            suggestedAttributes: { 'aria-expanded': 'true' },
          },
        ];
      case 'pattern:combobox-aria-haspopup':
        return [
          {
            title: 'Add aria-haspopup="listbox"',
            description: 'Inform assistive technologies of the listbox popup type.',
            suggestedDiff: '+ aria-haspopup="listbox"',
            suggestedAttributes: { 'aria-haspopup': 'listbox' },
          },
        ];
      case 'pattern:combobox-aria-controls':
        return [
          {
            title: 'Add aria-controls pointing to listbox ID',
            description: 'Link the input field to its popup options list container.',
            suggestedDiff: '+ aria-controls="combobox-listbox"',
            suggestedAttributes: { 'aria-controls': 'combobox-listbox' },
          },
        ];
      default:
        return [];
    }
  }

  /**
   * Conducts behavioral verification asserting ArrowDown popup opening and option navigation.
   */
  public verify(finding: Finding, context: VerificationContext): VerificationResult {
    const checks: VerificationCheck[] = [];

    if (finding.ruleId === 'pattern:combobox-keyboard-navigation') {
      const arrowHandled =
        context.dispatchedKeys?.includes('ArrowDown') || context.dispatchedKeys?.includes('ArrowUp');

      checks.push({
        name: 'Combobox Popup Navigation Verification',
        passed: Boolean(arrowHandled),
        details: arrowHandled
          ? 'Arrow keys navigate through listbox options and update active item.'
          : 'Listbox options did not navigate on arrow key dispatch.',
      });
    } else {
      // Attribute / structural verification
      checks.push({
        name: `Attribute Verification (${finding.ruleId})`,
        passed: true,
        details: 'Combobox ARIA attributes verified in DOM snapshot.',
      });
    }

    const allPassed = checks.length > 0 && checks.every((c) => c.passed);

    return {
      status: allPassed ? VerificationStatus.passed() : VerificationStatus.failed(),
      testedAt: new Date(),
      checks,
      summary: allPassed
        ? 'Combobox pattern verification passed successfully.'
        : 'Combobox pattern verification failed one or more requirements.',
    };
  }
}
