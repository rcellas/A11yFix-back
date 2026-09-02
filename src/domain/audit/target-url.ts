import { InvalidUrlError } from '../errors/domain.error';

/**
 * Value Object representing a validated public target URL for accessibility analysis.
 * Invariant: Must use HTTP or HTTPS protocol and have a valid host.
 */
export class TargetUrl {
  private readonly _parsed: URL;

  private constructor(url: string) {
    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      throw new InvalidUrlError(url, 'URL cannot be empty');
    }

    try {
      this._parsed = new URL(url.trim());
    } catch {
      throw new InvalidUrlError(url, 'Malformed URL format');
    }

    if (this._parsed.protocol !== 'http:' && this._parsed.protocol !== 'https:') {
      throw new InvalidUrlError(
        url,
        `Unsupported protocol "${this._parsed.protocol}". Only "http:" and "https:" are allowed.`,
      );
    }

    if (!this._parsed.hostname) {
      throw new InvalidUrlError(url, 'Missing hostname');
    }
  }

  public static create(url: string): TargetUrl {
    return new TargetUrl(url);
  }

  public get value(): string {
    return this._parsed.href;
  }

  public get hostname(): string {
    return this._parsed.hostname;
  }

  public get protocol(): string {
    return this._parsed.protocol;
  }

  public get pathname(): string {
    return this._parsed.pathname;
  }

  public get origin(): string {
    return this._parsed.origin;
  }

  public equals(other?: TargetUrl | null): boolean {
    if (!other) return false;
    return this.value === other.value;
  }

  public toString(): string {
    return this.value;
  }

  public toJSON(): string {
    return this.value;
  }
}
