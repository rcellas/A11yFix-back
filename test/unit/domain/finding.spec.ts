import { describe, it, expect } from 'vitest';
import { Finding } from '../../../src/domain/finding/finding';
import { AuditId } from '../../../src/domain/audit/audit-id';
import { Severity } from '../../../src/domain/finding/severity';
import { ElementSelector } from '../../../src/domain/finding/element-selector';
import { PatternType } from '../../../src/domain/pattern/pattern-type';

describe('Finding Aggregate Root', () => {
  const auditId = AuditId.create();
  const selector = ElementSelector.create({
    cssSelector: '#terms-modal',
    role: 'dialog',
    accessibleName: 'Terms & Conditions',
  });

  it('should create a standard axe finding', () => {
    const finding = Finding.create({
      auditId,
      ruleId: 'axe:color-contrast',
      severity: Severity.serious(),
      message: 'Elements must have sufficient color contrast ratio.',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast',
      targetSelector: ElementSelector.fromCss('.footer > p'),
      htmlSnippet: '<p class="text-gray-400">Copyright 2026</p>',
    });

    expect(finding.id).toBeDefined();
    expect(finding.auditId.equals(auditId)).toBe(true);
    expect(finding.ruleId).toBe('axe:color-contrast');
    expect(finding.severity.value).toBe('serious');
    expect(finding.message).toBe('Elements must have sufficient color contrast ratio.');
    expect(finding.helpUrl).toBe('https://dequeuniversity.com/rules/axe/4.4/color-contrast');
    expect(finding.htmlSnippet).toBe('<p class="text-gray-400">Copyright 2026</p>');
    expect(finding.isPatternFinding()).toBe(false);
    expect(finding.isAxeFinding()).toBe(true);
    expect(finding.isCritical()).toBe(false);
  });

  it('should create a pattern-specific finding', () => {
    const finding = Finding.create({
      auditId,
      patternType: PatternType.dialog(),
      ruleId: 'pattern:dialog-focus-trap',
      severity: Severity.critical(),
      message: 'Dialog modal must trap Tab focus within dialog container.',
      targetSelector: selector,
      htmlSnippet: '<div role="dialog" aria-modal="true"></div>',
    });

    expect(finding.patternType?.value).toBe('DIALOG');
    expect(finding.isPatternFinding()).toBe(true);
    expect(finding.isAxeFinding()).toBe(false);
    expect(finding.isCritical()).toBe(true);
  });

  it('should reject empty required fields', () => {
    expect(() =>
      Finding.create({
        auditId,
        ruleId: '',
        severity: Severity.minor(),
        message: 'Some error',
        targetSelector: selector,
        htmlSnippet: '<div></div>',
      }),
    ).toThrow('Finding requires a non-empty ruleId.');

    expect(() =>
      Finding.create({
        auditId,
        ruleId: 'axe:image-alt',
        severity: Severity.minor(),
        message: '   ',
        targetSelector: selector,
        htmlSnippet: '<div></div>',
      }),
    ).toThrow('Finding requires a non-empty message.');

    expect(() =>
      Finding.create({
        auditId,
        ruleId: 'axe:image-alt',
        severity: Severity.minor(),
        message: 'Image requires alt attribute',
        targetSelector: selector,
        htmlSnippet: '',
      }),
    ).toThrow('Finding requires a non-empty htmlSnippet.');
  });

  it('should reconstitute properly from persistent store', () => {
    const reconstituted = Finding.reconstitute({
      id: 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d',
      auditId: auditId.value,
      patternType: 'DIALOG',
      ruleId: 'pattern:dialog-focus-trap',
      severity: 'critical',
      message: 'Dialog focus trap failed',
      helpUrl: null,
      targetSelector: {
        cssSelector: '#modal',
        role: 'dialog',
      },
      htmlSnippet: '<div id="modal" role="dialog"></div>',
      createdAt: '2026-09-02T22:30:00.000Z',
    });

    expect(reconstituted.id.value).toBe('a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d');
    expect(reconstituted.patternType?.value).toBe('DIALOG');
    expect(reconstituted.severity.value).toBe('critical');
    expect(reconstituted.targetSelector.cssSelector).toBe('#modal');
    expect(reconstituted.targetSelector.role).toBe('dialog');
  });

  it('should serialize cleanly to JSON', () => {
    const finding = Finding.create({
      auditId,
      ruleId: 'axe:label',
      severity: Severity.moderate(),
      message: 'Form elements must have labels',
      targetSelector: ElementSelector.fromCss('input#email'),
      htmlSnippet: '<input id="email" type="text" />',
    });

    const json = finding.toJSON();
    expect(json.id).toBe(finding.id.value);
    expect(json.auditId).toBe(auditId.value);
    expect(json.ruleId).toBe('axe:label');
    expect(json.severity).toBe('moderate');
    expect(json.targetSelector.cssSelector).toBe('input#email');
    expect(typeof json.createdAt).toBe('string');
  });
});
