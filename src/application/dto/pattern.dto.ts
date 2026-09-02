import { DomElementSnapshot } from '../../domain/pattern/pattern-context';
import { ElementSelectorProps } from '../../domain/finding/element-selector';

export interface InspectPatternInput {
  targetElement: DomElementSnapshot;
  patternType?: string; // Optional: if omitted, runs all matching pattern detectors
}

export interface PatternViolationOutput {
  ruleId: string;
  message: string;
  severity: string;
  targetSelector: ElementSelectorProps;
  htmlSnippet: string;
  helpUrl?: string;
}

export interface PatternInspectionOutput {
  patternType: string;
  passed: boolean;
  violations: PatternViolationOutput[];
  inspectedAt: string;
}
