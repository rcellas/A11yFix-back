import { FindingId } from './finding-id';
import { AuditId } from '../audit/audit-id';
import { PatternType } from '../pattern/pattern-type';
import { Severity } from './severity';
import { ElementSelector, ElementSelectorProps } from './element-selector';

export interface FindingProps {
  id: FindingId;
  auditId: AuditId;
  patternType?: PatternType;
  ruleId: string;
  severity: Severity;
  message: string;
  helpUrl?: string;
  targetSelector: ElementSelector;
  htmlSnippet: string;
  createdAt: Date;
}

export interface CreateFindingProps {
  id?: FindingId;
  auditId: AuditId;
  patternType?: PatternType;
  ruleId: string;
  severity: Severity;
  message: string;
  helpUrl?: string;
  targetSelector: ElementSelector;
  htmlSnippet: string;
  createdAt?: Date;
}

export interface ReconstituteFindingProps {
  id: string;
  auditId: string;
  patternType?: string | null;
  ruleId: string;
  severity: string;
  message: string;
  helpUrl?: string | null;
  targetSelector: ElementSelectorProps;
  htmlSnippet: string;
  createdAt: string | Date;
}

/**
 * Aggregate root representing an individual Accessibility Finding (violation or pattern defect).
 * 100% pure TypeScript, zero framework dependencies.
 */
export class Finding {
  private readonly _id: FindingId;
  private readonly _auditId: AuditId;
  private readonly _patternType?: PatternType;
  private readonly _ruleId: string;
  private readonly _severity: Severity;
  private readonly _message: string;
  private readonly _helpUrl?: string;
  private readonly _targetSelector: ElementSelector;
  private readonly _htmlSnippet: string;
  private readonly _createdAt: Date;

  private constructor(props: FindingProps) {
    this._id = props.id;
    this._auditId = props.auditId;
    this._patternType = props.patternType;
    this._ruleId = props.ruleId;
    this._severity = props.severity;
    this._message = props.message;
    this._helpUrl = props.helpUrl;
    this._targetSelector = props.targetSelector;
    this._htmlSnippet = props.htmlSnippet;
    this._createdAt = props.createdAt;
  }

  /**
   * Factory method to create a new Finding with invariant validation.
   */
  public static create(props: CreateFindingProps): Finding {
    if (!props.ruleId || props.ruleId.trim().length === 0) {
      throw new Error('Finding requires a non-empty ruleId.');
    }
    if (!props.message || props.message.trim().length === 0) {
      throw new Error('Finding requires a non-empty message.');
    }
    if (!props.htmlSnippet || props.htmlSnippet.trim().length === 0) {
      throw new Error('Finding requires a non-empty htmlSnippet.');
    }

    return new Finding({
      id: props.id ?? FindingId.create(),
      auditId: props.auditId,
      patternType: props.patternType,
      ruleId: props.ruleId.trim(),
      severity: props.severity,
      message: props.message.trim(),
      helpUrl: props.helpUrl?.trim(),
      targetSelector: props.targetSelector,
      htmlSnippet: props.htmlSnippet.trim(),
      createdAt: props.createdAt ?? new Date(),
    });
  }

  /**
   * Reconstitutes a Finding aggregate from persistent storage.
   */
  public static reconstitute(props: ReconstituteFindingProps): Finding {
    return new Finding({
      id: FindingId.fromString(props.id),
      auditId: AuditId.fromString(props.auditId),
      patternType: props.patternType ? PatternType.create(props.patternType) : undefined,
      ruleId: props.ruleId,
      severity: Severity.create(props.severity),
      message: props.message,
      helpUrl: props.helpUrl ?? undefined,
      targetSelector: ElementSelector.create(props.targetSelector),
      htmlSnippet: props.htmlSnippet,
      createdAt: new Date(props.createdAt),
    });
  }

  public get id(): FindingId {
    return this._id;
  }

  public get auditId(): AuditId {
    return this._auditId;
  }

  public get patternType(): PatternType | undefined {
    return this._patternType;
  }

  public get ruleId(): string {
    return this._ruleId;
  }

  public get severity(): Severity {
    return this._severity;
  }

  public get message(): string {
    return this._message;
  }

  public get helpUrl(): string | undefined {
    return this._helpUrl;
  }

  public get targetSelector(): ElementSelector {
    return this._targetSelector;
  }

  public get htmlSnippet(): string {
    return this._htmlSnippet;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public isPatternFinding(): boolean {
    return this._patternType !== undefined;
  }

  public isAxeFinding(): boolean {
    return this._ruleId.startsWith('axe:');
  }

  public isCritical(): boolean {
    return this._severity.value === 'critical';
  }

  public toJSON(): {
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
  } {
    return {
      id: this._id.value,
      auditId: this._auditId.value,
      patternType: this._patternType?.value,
      ruleId: this._ruleId,
      severity: this._severity.value,
      message: this._message,
      helpUrl: this._helpUrl,
      targetSelector: this._targetSelector.toJSON(),
      htmlSnippet: this._htmlSnippet,
      createdAt: this._createdAt.toISOString(),
    };
  }
}
