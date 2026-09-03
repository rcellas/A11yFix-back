import { DomElementSnapshot } from '../../domain/pattern/pattern-context';

export interface VerifyRemediationInput {
  findingId: string;
  activeElement?: DomElementSnapshot;
  dispatchedKeys?: string[];
  focusTrapped?: boolean;
}

export interface VerificationCheckOutput {
  name: string;
  passed: boolean;
  details?: string;
}

export interface VerificationOutput {
  status: string;
  testedAt: string;
  checks: VerificationCheckOutput[];
  summary: string;
}
