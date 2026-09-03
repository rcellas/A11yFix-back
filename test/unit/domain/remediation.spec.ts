import { describe, it, expect } from 'vitest';
import { Remediation } from '../../../src/domain/remediation/remediation';
import { FindingId } from '../../../src/domain/finding/finding-id';
import { ApprovalRequiredError, InvalidStateTransitionError } from '../../../src/domain/errors/domain.error';

describe('Remediation (Domain Aggregate Root)', () => {
  const findingId = FindingId.create();
  const sampleProposal = {
    title: 'Add aria-modal="true"',
    description: 'Mark modal dialog container',
    suggestedDiff: '+ aria-modal="true"',
    suggestedAttributes: { 'aria-modal': 'true' },
  };

  it('should create remediation in proposed state', () => {
    const remediation = Remediation.propose(findingId, sampleProposal);

    expect(remediation.id).toBeDefined();
    expect(remediation.findingId.value).toBe(findingId.value);
    expect(remediation.status.isProposed()).toBe(true);
    expect(remediation.proposal.title).toBe('Add aria-modal="true"');
    expect(remediation.createdAt).toBeInstanceOf(Date);
  });

  it('should approve proposal successfully', () => {
    const remediation = Remediation.propose(findingId, sampleProposal);
    remediation.approve();

    expect(remediation.status.isApproved()).toBe(true);
    expect(remediation.approvedAt).toBeInstanceOf(Date);
  });

  it('should apply approved proposal successfully', () => {
    const remediation = Remediation.propose(findingId, sampleProposal);
    remediation.approve();
    remediation.apply();

    expect(remediation.status.isApplied()).toBe(true);
    expect(remediation.appliedAt).toBeInstanceOf(Date);
  });

  it('should throw ApprovalRequiredError when applying unapproved proposal', () => {
    const remediation = Remediation.propose(findingId, sampleProposal);

    expect(() => remediation.apply()).toThrow(ApprovalRequiredError);
  });

  it('should reject proposal with reason', () => {
    const remediation = Remediation.propose(findingId, sampleProposal);
    remediation.reject('Not appropriate for custom design system');

    expect(remediation.status.isRejected()).toBe(true);
    expect(remediation.rejectionReason).toBe('Not appropriate for custom design system');
    expect(remediation.rejectedAt).toBeInstanceOf(Date);
  });

  it('should prevent invalid state transitions from rejected state', () => {
    const remediation = Remediation.propose(findingId, sampleProposal);
    remediation.reject();

    expect(() => remediation.approve()).toThrow(InvalidStateTransitionError);
  });

  it('should reconstitute from snapshot accurately', () => {
    const original = Remediation.propose(findingId, sampleProposal);
    original.approve();
    original.apply();

    const snapshot = original.toJSON();
    const reconstituted = Remediation.reconstitute({
      id: snapshot.id,
      findingId: snapshot.findingId,
      status: snapshot.status,
      proposal: snapshot.proposal,
      createdAt: snapshot.createdAt,
      approvedAt: snapshot.approvedAt,
      appliedAt: snapshot.appliedAt,
    });

    expect(reconstituted.id.value).toBe(original.id.value);
    expect(reconstituted.status.isApplied()).toBe(true);
    expect(reconstituted.proposal.title).toBe(original.proposal.title);
  });
});
