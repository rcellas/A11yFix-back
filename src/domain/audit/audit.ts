import { AuditId } from './audit-id';
import { TargetUrl } from './target-url';
import { AuditStatus } from './audit-status';
import { Page } from './page';

export interface AuditProps {
  id: AuditId;
  url: TargetUrl;
  status: AuditStatus;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
  findingsCount: number;
  page?: Page;
}

export interface ReconstituteAuditProps {
  id: string;
  url: string;
  status: string;
  createdAt: string | Date;
  startedAt?: string | Date | null;
  completedAt?: string | Date | null;
  errorMessage?: string | null;
  findingsCount: number;
  page?: {
    url: string;
    title?: string;
    domSnapshotSnippet?: string;
    inspectedAt?: string | Date;
  } | null;
}

/**
 * Aggregate root representing an Accessibility Audit execution.
 * Enforces audit lifecycle state transitions, invariants, and timings.
 */
export class Audit {
  private readonly _id: AuditId;
  private readonly _url: TargetUrl;
  private _status: AuditStatus;
  private readonly _createdAt: Date;
  private _startedAt?: Date;
  private _completedAt?: Date;
  private _errorMessage?: string;
  private _findingsCount: number;
  private _page?: Page;

  private constructor(props: AuditProps) {
    this._id = props.id;
    this._url = props.url;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._startedAt = props.startedAt;
    this._completedAt = props.completedAt;
    this._errorMessage = props.errorMessage;
    this._findingsCount = props.findingsCount;
    this._page = props.page;
  }

  /**
   * Factory method to initiate a new audit.
   * Starts in "created" state with 0 findings.
   */
  public static create(url: TargetUrl, id?: AuditId): Audit {
    return new Audit({
      id: id ?? AuditId.create(),
      url,
      status: AuditStatus.created(),
      createdAt: new Date(),
      findingsCount: 0,
    });
  }

  /**
   * Reconstitutes an Audit from a persistent store snapshot without enforcing creation invariants.
   */
  public static reconstitute(props: ReconstituteAuditProps): Audit {
    return new Audit({
      id: AuditId.fromString(props.id),
      url: TargetUrl.create(props.url),
      status: AuditStatus.fromString(props.status),
      createdAt: new Date(props.createdAt),
      startedAt: props.startedAt ? new Date(props.startedAt) : undefined,
      completedAt: props.completedAt ? new Date(props.completedAt) : undefined,
      errorMessage: props.errorMessage ?? undefined,
      findingsCount: props.findingsCount,
      page: props.page
        ? Page.create({
            url: TargetUrl.create(props.page.url),
            title: props.page.title,
            domSnapshotSnippet: props.page.domSnapshotSnippet,
            inspectedAt: props.page.inspectedAt ? new Date(props.page.inspectedAt) : undefined,
          })
        : undefined,
    });
  }

  public get id(): AuditId {
    return this._id;
  }

  public get url(): TargetUrl {
    return this._url;
  }

  public get status(): AuditStatus {
    return this._status;
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public get startedAt(): Date | undefined {
    return this._startedAt;
  }

  public get completedAt(): Date | undefined {
    return this._completedAt;
  }

  public get errorMessage(): string | undefined {
    return this._errorMessage;
  }

  public get findingsCount(): number {
    return this._findingsCount;
  }

  public get page(): Page | undefined {
    return this._page;
  }

  /**
   * Transitions audit state to 'running' and marks startedAt timestamp.
   */
  public start(at: Date = new Date()): void {
    this._status = this._status.transitionTo(AuditStatus.running());
    this._startedAt = at;
  }

  /**
   * Transitions audit state to 'completed', registers findings count, and optionally links the inspected page.
   */
  public complete(findingsCount: number, page?: Page, at: Date = new Date()): void {
    if (findingsCount < 0 || !Number.isInteger(findingsCount)) {
      throw new Error('findingsCount must be a non-negative integer.');
    }
    this._status = this._status.transitionTo(AuditStatus.completed());
    this._findingsCount = findingsCount;
    this._completedAt = at;
    if (page) {
      this._page = page;
    }
  }

  /**
   * Transitions audit state to 'failed' and records the error message.
   */
  public fail(errorMessage: string, at: Date = new Date()): void {
    if (!errorMessage || errorMessage.trim().length === 0) {
      throw new Error('Audit failure requires a non-empty errorMessage.');
    }
    this._status = this._status.transitionTo(AuditStatus.failed());
    this._errorMessage = errorMessage.trim();
    this._completedAt = at;
  }

  public toJSON(): {
    id: string;
    url: string;
    status: string;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    errorMessage?: string;
    findingsCount: number;
    page?: ReturnType<Page['toJSON']>;
  } {
    return {
      id: this._id.value,
      url: this._url.value,
      status: this._status.value,
      createdAt: this._createdAt.toISOString(),
      startedAt: this._startedAt?.toISOString(),
      completedAt: this._completedAt?.toISOString(),
      errorMessage: this._errorMessage,
      findingsCount: this._findingsCount,
      page: this._page?.toJSON(),
    };
  }
}
