import { RemediationId } from './remediation-id';
import { FindingId } from '../finding/finding-id';
import { RemediationStatus } from './remediation-status';
import { FixProposal } from '../pattern/pattern-context';
import { ApprovalRequiredError } from '../errors/domain.error';

export interface RemediationProps {
  id: RemediationId;
  findingId: FindingId;
  status: RemediationStatus;
  proposal: FixProposal;
  createdAt: Date;
  approvedAt?: Date;
  appliedAt?: Date;
  rejectedAt?: Date;
  rejectionReason?: string;
}

export interface ReconstituteRemediationProps {
  id: string;
  findingId: string;
  status: string;
  proposal: {
    title: string;
    description: string;
    suggestedDiff?: string;
    suggestedAttributes?: Record<string, string>;
  };
  createdAt: string | Date;
  approvedAt?: string | Date | null;
  appliedAt?: string | Date | null;
  rejectedAt?: string | Date | null;
  rejectionReason?: string | null;
}

/**
 * Aggregate root representing a Remediation Fix Proposal lifecycle.
 * Invariant: Cannot transition to 'applied' without prior 'approved' state.
 */
export class Remediation {
  private readonly _id: RemediationId;
  private readonly _findingId: FindingId;
  private _status: RemediationStatus;
  private readonly _proposal: FixProposal;
  private readonly _createdAt: Date;
  private _approvedAt?: Date;
  private _appliedAt?: Date;
  private _rejectedAt?: Date;
  private _rejectionReason?: string;

  private constructor(props: RemediationProps) {
    this._id = props.id;
    this._findingId = props.findingId;
    this._status = props.status;
    this._proposal = props.proposal;
    this._createdAt = props.createdAt;
    this._approvedAt = props.approvedAt;
    this._appliedAt = props.appliedAt;
    this._rejectedAt = props.rejectedAt;
    this._rejectionReason = props.rejectionReason;
  }

  public static propose(
    findingId: FindingId,
    proposal: FixProposal,
    id?: RemediationId,
  ): Remediation {
    return new Remediation({
      id: id ?? RemediationId.create(),
      findingId,
      status: RemediationStatus.proposed(),
      proposal,
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: ReconstituteRemediationProps): Remediation {
    return new Remediation({
      id: RemediationId.fromString(props.id),
      findingId: FindingId.fromString(props.findingId),
      status: RemediationStatus.fromString(props.status),
      proposal: props.proposal,
      createdAt: new Date(props.createdAt),
      approvedAt: props.approvedAt ? new Date(props.approvedAt) : undefined,
      appliedAt: props.appliedAt ? new Date(props.appliedAt) : undefined,
      rejectedAt: props.rejectedAt ? new Date(props.rejectedAt) : undefined,
      rejectionReason: props.rejectionReason ?? undefined,
    });
  }

  public get id(): RemediationId {
    return this._id;
  }

  public get findingId(): FindingId {
    return this._findingId;
  }

  public get status(): RemediationStatus {
    return this._status;
  }

  public get proposal(): FixProposal {
    return this._proposal;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get approvedAt(): Date | undefined {
    return this._approvedAt;
  }

  public get appliedAt(): Date | undefined {
    return this._appliedAt;
  }

  public get rejectedAt(): Date | undefined {
    return this._rejectedAt;
  }

  public get rejectionReason(): string | undefined {
    return this._rejectionReason;
  }

  /**
   * Approves the remediation proposal.
   */
  public approve(at: Date = new Date()): void {
    this._status = this._status.transitionTo(RemediationStatus.approved());
    this._approvedAt = at;
  }

  /**
   * Applies the approved remediation.
   * Invariant: Throws ApprovalRequiredError if not approved first.
   */
  public apply(at: Date = new Date()): void {
    if (!this._status.isApproved()) {
      throw new ApprovalRequiredError(this._id.value);
    }
    this._status = this._status.transitionTo(RemediationStatus.applied());
    this._appliedAt = at;
  }

  /**
   * Rejects the proposed remediation.
   */
  public reject(reason?: string, at: Date = new Date()): void {
    this._status = this._status.transitionTo(RemediationStatus.rejected());
    this._rejectionReason = reason;
    this._rejectedAt = at;
  }

  public toJSON(): {
    id: string;
    findingId: string;
    status: string;
    proposal: FixProposal;
    createdAt: string;
    approvedAt?: string;
    appliedAt?: string;
    rejectedAt?: string;
    rejectionReason?: string;
  } {
    return {
      id: this._id.value,
      findingId: this._findingId.value,
      status: this._status.value,
      proposal: this._proposal,
      createdAt: this._createdAt.toISOString(),
      approvedAt: this._approvedAt?.toISOString(),
      appliedAt: this._appliedAt?.toISOString(),
      rejectedAt: this._rejectedAt?.toISOString(),
      rejectionReason: this._rejectionReason,
    };
  }
}
