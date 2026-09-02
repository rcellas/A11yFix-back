import { describe, it, expect } from 'vitest';
import { Audit } from '../../../src/domain/audit/audit';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Page } from '../../../src/domain/audit/page';
import { InvalidStateTransitionError } from '../../../src/domain/errors/domain.error';

describe('Audit Aggregate Root', () => {
  const sampleUrl = TargetUrl.create('https://example.com/app');

  it('should initialize in created status with 0 findings', () => {
    const audit = Audit.create(sampleUrl);

    expect(audit.id).toBeInstanceOf(AuditId);
    expect(audit.url.value).toBe('https://example.com/app');
    expect(audit.status.value).toBe('created');
    expect(audit.findingsCount).toBe(0);
    expect(audit.createdAt).toBeInstanceOf(Date);
    expect(audit.startedAt).toBeUndefined();
    expect(audit.completedAt).toBeUndefined();
    expect(audit.errorMessage).toBeUndefined();
    expect(audit.page).toBeUndefined();
  });

  it('should transition created -> running on start()', () => {
    const audit = Audit.create(sampleUrl);
    const startTime = new Date('2026-09-02T22:30:00.000Z');

    audit.start(startTime);

    expect(audit.status.value).toBe('running');
    expect(audit.startedAt).toEqual(startTime);
  });

  it('should transition running -> completed on complete()', () => {
    const audit = Audit.create(sampleUrl);
    audit.start();

    const page = Page.create({ url: sampleUrl, title: 'App Main' });
    const finishTime = new Date('2026-09-02T22:31:00.000Z');

    audit.complete(5, page, finishTime);

    expect(audit.status.value).toBe('completed');
    expect(audit.findingsCount).toBe(5);
    expect(audit.completedAt).toEqual(finishTime);
    expect(audit.page?.title).toBe('App Main');
  });

  it('should transition running -> failed on fail()', () => {
    const audit = Audit.create(sampleUrl);
    audit.start();

    const failureTime = new Date('2026-09-02T22:31:30.000Z');
    audit.fail('Navigation timeout reached', failureTime);

    expect(audit.status.value).toBe('failed');
    expect(audit.errorMessage).toBe('Navigation timeout reached');
    expect(audit.completedAt).toEqual(failureTime);
  });

  it('should reject invalid state transitions with InvalidStateTransitionError', () => {
    const audit = Audit.create(sampleUrl);

    // Cannot complete directly from created
    expect(() => audit.complete(3)).toThrow(InvalidStateTransitionError);

    // Start -> Complete
    audit.start();
    audit.complete(0);

    // Terminal state cannot restart
    expect(() => audit.start()).toThrow(InvalidStateTransitionError);
  });

  it('should reject negative findingsCount', () => {
    const audit = Audit.create(sampleUrl);
    audit.start();

    expect(() => audit.complete(-1)).toThrow('findingsCount must be a non-negative integer.');
  });

  it('should reject empty errorMessage on failure', () => {
    const audit = Audit.create(sampleUrl);
    audit.start();

    expect(() => audit.fail('')).toThrow('Audit failure requires a non-empty errorMessage.');
    expect(() => audit.fail('   ')).toThrow('Audit failure requires a non-empty errorMessage.');
  });

  it('should reconstitute properly from persistent store', () => {
    const reconstituted = Audit.reconstitute({
      id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      url: 'https://example.com/login',
      status: 'completed',
      createdAt: '2026-09-02T20:00:00.000Z',
      startedAt: '2026-09-02T20:01:00.000Z',
      completedAt: '2026-09-02T20:02:00.000Z',
      findingsCount: 4,
      errorMessage: null,
      page: {
        url: 'https://example.com/login',
        title: 'Login Page',
      },
    });

    expect(reconstituted.id.value).toBe('f47ac10b-58cc-4372-a567-0e02b2c3d479');
    expect(reconstituted.status.value).toBe('completed');
    expect(reconstituted.findingsCount).toBe(4);
    expect(reconstituted.page?.title).toBe('Login Page');
  });

  it('should serialize cleanly to JSON', () => {
    const audit = Audit.create(sampleUrl);
    const json = audit.toJSON();

    expect(json.id).toBe(audit.id.value);
    expect(json.url).toBe(sampleUrl.value);
    expect(json.status).toBe('created');
    expect(json.findingsCount).toBe(0);
    expect(typeof json.createdAt).toBe('string');
  });
});
