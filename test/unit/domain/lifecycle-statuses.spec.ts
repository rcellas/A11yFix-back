import { describe, it, expect } from 'vitest';
import { AuditStatus } from '../../../src/domain/audit/audit-status';
import { RemediationStatus } from '../../../src/domain/remediation/remediation-status';
import { VerificationStatus } from '../../../src/domain/verification/verification-status';
import { InvalidStateTransitionError } from '../../../src/domain/errors/domain.error';

describe('Lifecycle Status Value Objects', () => {
  describe('AuditStatus', () => {
    it('should transition created -> running -> completed', () => {
      const s1 = AuditStatus.created();
      expect(s1.value).toBe('created');
      expect(s1.canTransitionTo(AuditStatus.running())).toBe(true);

      const s2 = s1.transitionTo(AuditStatus.running());
      expect(s2.value).toBe('running');
      expect(s2.canTransitionTo(AuditStatus.completed())).toBe(true);

      const s3 = s2.transitionTo(AuditStatus.completed());
      expect(s3.value).toBe('completed');
      expect(s3.isTerminal()).toBe(true);
    });

    it('should transition running -> failed', () => {
      const s1 = AuditStatus.running();
      const s2 = s1.transitionTo(AuditStatus.failed());
      expect(s2.value).toBe('failed');
      expect(s2.isTerminal()).toBe(true);
    });

    it('should reject illegal transitions with InvalidStateTransitionError', () => {
      const sCreated = AuditStatus.created();
      expect(() => sCreated.transitionTo(AuditStatus.completed())).toThrow(
        InvalidStateTransitionError,
      );

      const sCompleted = AuditStatus.completed();
      expect(() => sCompleted.transitionTo(AuditStatus.running())).toThrow(
        InvalidStateTransitionError,
      );
    });
  });

  describe('RemediationStatus', () => {
    it('should follow proposed -> approved -> applied -> verified pipeline', () => {
      const s1 = RemediationStatus.proposed();
      expect(s1.isApproved()).toBe(false);

      const s2 = s1.transitionTo(RemediationStatus.approved());
      expect(s2.isApproved()).toBe(true);

      const s3 = s2.transitionTo(RemediationStatus.applied());
      expect(s3.isApproved()).toBe(true);

      const s4 = s3.transitionTo(RemediationStatus.verified());
      expect(s4.isApproved()).toBe(true);
    });

    it('should allow rejecting a proposal', () => {
      const s1 = RemediationStatus.proposed();
      const s2 = s1.transitionTo(RemediationStatus.rejected());
      expect(s2.value).toBe('rejected');
    });

    it('should reject invalid transition from proposed directly to applied', () => {
      const s1 = RemediationStatus.proposed();
      expect(() => s1.transitionTo(RemediationStatus.applied())).toThrow(
        InvalidStateTransitionError,
      );
    });
  });

  describe('VerificationStatus', () => {
    it('should represent explicit passed or failed states', () => {
      const passed = VerificationStatus.passed();
      const failed = VerificationStatus.failed();

      expect(passed.isPassed()).toBe(true);
      expect(passed.isFailed()).toBe(false);

      expect(failed.isPassed()).toBe(false);
      expect(failed.isFailed()).toBe(true);
    });
  });
});
