import { ElementSelectorProps } from '../../domain/finding/element-selector';

export interface GetFindingsInput {
  auditId: string;
}

export interface GetFindingInput {
  id: string;
}

export interface FindingOutput {
  id: string;
  auditId: string;
  patternType?: string;
  ruleId: string;
  severity: string;
  message: string;
  helpUrl?: string;
  targetSelector: ElementSelectorProps;
  htmlSnippet: string;
  createdAt: string;
}
