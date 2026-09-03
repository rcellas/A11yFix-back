import { InvalidUrlError } from '../errors/domain.error';

/**
 * Value Object representing a validated public target URL for accessibility analysis.
 * Invariant: Must use HTTP or HTTPS protocol and satisfy SSRF defense-in-depth rules.
 * Prohibits loopback, internal, private, and cloud metadata addresses.
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

    if (this._parsed.username || this._parsed.password) {
      throw new InvalidUrlError(url, 'URL must not contain embedded user credentials');
    }

    this.validateSsrfSafety(this._parsed.hostname, url);
  }

  public static create(url: string): TargetUrl {
    return new TargetUrl(url);
  }

  private validateSsrfSafety(hostname: string, rawUrl: string): void {
    const lower = hostname.toLowerCase();

    // 1. Prohibit localhost, local domains, and internal names
    if (
      lower === 'localhost' ||
      lower.endsWith('.localhost') ||
      lower.endsWith('.local') ||
      lower.endsWith('.internal') ||
      lower.endsWith('.localdomain')
    ) {
      throw new InvalidUrlError(
        rawUrl,
        `Target host "${hostname}" is a local/internal address prohibited by SSRF security policy.`,
      );
    }

    // 2. Prohibit IPv4 Private / Loopback / Link-Local / Metadata
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const ipv4Match = lower.match(ipv4Regex);
    if (ipv4Match) {
      const octets = ipv4Match.slice(1, 5).map((o) => parseInt(o, 10));
      if (octets.some((o) => o > 255)) {
        throw new InvalidUrlError(rawUrl, 'Invalid IPv4 octet value');
      }

      const [o1, o2] = octets;

      // 0.0.0.0/8 (broadcast/current)
      if (o1 === 0) {
        throw new InvalidUrlError(rawUrl, 'Access to 0.0.0.0/8 network is prohibited');
      }
      // 127.0.0.0/8 (loopback)
      if (o1 === 127) {
        throw new InvalidUrlError(rawUrl, 'Access to loopback IP range 127.0.0.0/8 is prohibited');
      }
      // 10.0.0.0/8 (RFC 1918 private)
      if (o1 === 10) {
        throw new InvalidUrlError(rawUrl, 'Access to private IP range 10.0.0.0/8 is prohibited');
      }
      // 172.16.0.0/12 (RFC 1918 private: 172.16.0.0 - 172.31.255.255)
      if (o1 === 172 && o2 >= 16 && o2 <= 31) {
        throw new InvalidUrlError(rawUrl, 'Access to private IP range 172.16.0.0/12 is prohibited');
      }
      // 192.168.0.0/16 (RFC 1918 private)
      if (o1 === 192 && o2 === 168) {
        throw new InvalidUrlError(rawUrl, 'Access to private IP range 192.168.0.0/16 is prohibited');
      }
      // 169.254.0.0/16 (Link-local & Cloud Instance Metadata e.g. 169.254.169.254)
      if (o1 === 169 && o2 === 254) {
        throw new InvalidUrlError(
          rawUrl,
          'Access to cloud metadata / link-local range 169.254.0.0/16 is prohibited',
        );
      }
    }

    // 3. Prohibit IPv6 Loopback / Private / Unspecified
    const cleanIpv6 = lower.replace(/^\[|\]$/g, '');
    if (
      cleanIpv6 === '::1' ||
      cleanIpv6 === '::' ||
      cleanIpv6.startsWith('fc') ||
      cleanIpv6.startsWith('fd') ||
      cleanIpv6.startsWith('fe80')
    ) {
      throw new InvalidUrlError(rawUrl, 'Access to IPv6 private/loopback addresses is prohibited');
    }
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
