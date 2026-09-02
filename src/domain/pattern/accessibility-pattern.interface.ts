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
import { Finding } from '../finding/finding';

/**
 * First-class domain contract for WAI-ARIA Accessibility Patterns.
 * Each pattern plugin (Dialog, Tabs, Disclosure, Combobox) implements this interface.
 * Adding a new pattern never modifies unrelated pattern code.
 */
export interface AccessibilityPattern {
  readonly type: PatternType;

  /**
   * Evaluates heuristics to determine if this pattern applies to the given DOM context.
   */
  detect(context: PatternContext): DetectionResult;

  /**
   * Conducts deep structural, relationship, and ARIA state inspection.
   */
  inspect(context: PatternContext): PatternAudit;

  /**
   * Generates actionable fix proposals for violations discovered by this pattern.
   */
  proposeFix(violation: PatternRuleViolation): FixProposal[];

  /**
   * Conducts behavioral verification asserting expected interactive behavior.
   */
  verify(finding: Finding, context: VerificationContext): VerificationResult;
}
