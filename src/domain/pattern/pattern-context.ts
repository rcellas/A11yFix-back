import { Severity } from '../finding/severity';
import { ElementSelector } from '../finding/element-selector';
import { VerificationStatus } from '../verification/verification-status';

/**
 * Pure domain representation of an inspected DOM element snapshot.
 * Decoupled from Playwright, Cheerio, or browser DOM nodes.
 */
export interface DomElementSnapshot {
  tagName: string;
  attributes: Record<string, string>;
  role?: string;
  accessibleName?: string;
  textContent?: string;
  outerHtml: string;
  children?: DomElementSnapshot[];
  isFocused?: boolean;
}

/**
 * Inspection context provided to patterns for detection and validation.
 */
export interface PatternContext {
  targetElement: DomElementSnapshot;
  documentRoot?: DomElementSnapshot;
  activeElement?: DomElementSnapshot;
  url?: string;
}

/**
 * Result of pattern detection heuristics.
 */
export interface DetectionResult {
  detected: boolean;
  confidence: number; // 0.0 to 1.0
  reason?: string;
  matchedElement: DomElementSnapshot;
}

/**
 * Individual rule violation found during pattern inspection.
 */
export interface PatternRuleViolation {
  ruleId: string;
  message: string;
  severity: Severity;
  targetSelector: ElementSelector;
  htmlSnippet: string;
  helpUrl?: string;
}

/**
 * Complete audit outcome of a pattern inspection.
 */
export interface PatternAudit {
  passed: boolean;
  violations: PatternRuleViolation[];
  inspectedAt: Date;
}

/**
 * Non-destructive proposal to remediate an accessibility defect.
 */
export interface FixProposal {
  title: string;
  description: string;
  suggestedDiff: string;
  suggestedAttributes: Record<string, string>;
}

/**
 * Individual check result during verification.
 */
export interface VerificationCheck {
  name: string;
  passed: boolean;
  details?: string;
}

/**
 * Result of behavioral verification.
 */
export interface VerificationResult {
  status: VerificationStatus;
  testedAt: Date;
  checks: VerificationCheck[];
  summary: string;
}

/**
 * Execution context for interactive verification.
 */
export interface VerificationContext {
  activeElement?: DomElementSnapshot;
  dispatchedKeys?: string[];
  focusTrapped?: boolean;
}
