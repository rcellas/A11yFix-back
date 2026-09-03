import { FixProposal } from '../../domain/pattern/pattern-context';

export interface ProposeRemediationInput {
  findingId: string;
}

export interface ApproveRemediationInput {
  remediationId: string;
}

export interface ApplyRemediationInput {
  remediationId: string;
}

export interface GetRemediationsInput {
  findingId: string;
}

export interface RemediationOutput {
  id: string;
  findingId: string;
  status: string;
  proposal: FixProposal;
  createdAt: string;
  approvedAt?: string;
  appliedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}
