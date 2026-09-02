import { TargetUrl } from './target-url';

export interface PageProps {
  url: TargetUrl;
  title?: string;
  domSnapshotSnippet?: string;
  inspectedAt?: Date;
}

/**
 * Domain entity representing an inspected web page within an Audit.
 */
export class Page {
  private readonly _url: TargetUrl;
  private readonly _title?: string;
  private readonly _domSnapshotSnippet?: string;
  private readonly _inspectedAt: Date;

  private constructor(props: PageProps) {
    this._url = props.url;
    this._title = props.title?.trim();
    this._domSnapshotSnippet = props.domSnapshotSnippet;
    this._inspectedAt = props.inspectedAt ?? new Date();
  }

  public static create(props: PageProps): Page {
    return new Page(props);
  }

  public get url(): TargetUrl {
    return this._url;
  }

  public get title(): string | undefined {
    return this._title;
  }

  public get domSnapshotSnippet(): string | undefined {
    return this._domSnapshotSnippet;
  }

  public get inspectedAt(): Date {
    return this._inspectedAt;
  }

  public toJSON(): {
    url: string;
    title?: string;
    domSnapshotSnippet?: string;
    inspectedAt: string;
  } {
    return {
      url: this._url.value,
      title: this._title,
      domSnapshotSnippet: this._domSnapshotSnippet,
      inspectedAt: this._inspectedAt.toISOString(),
    };
  }
}
