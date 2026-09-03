import { describe, it, expect } from 'vitest';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { InvalidUrlError } from '../../../src/domain/errors/domain.error';

describe('TargetUrl Value Object (with SSRF Defense-in-Depth)', () => {
  it('should accept valid public HTTPS and HTTP URLs', () => {
    const urlHttps = TargetUrl.create('https://example.com/login');
    expect(urlHttps.value).toBe('https://example.com/login');
    expect(urlHttps.hostname).toBe('example.com');
    expect(urlHttps.protocol).toBe('https:');
    expect(urlHttps.pathname).toBe('/login');

    const urlHttp = TargetUrl.create('http://example.org:8080/dashboard');
    expect(urlHttp.value).toBe('http://example.org:8080/dashboard');
    expect(urlHttp.hostname).toBe('example.org');
    expect(urlHttp.protocol).toBe('http:');
  });

  it('should reject unsupported protocols with InvalidUrlError', () => {
    expect(() => TargetUrl.create('ftp://example.com')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('file:///etc/passwd')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('javascript:alert(1)')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('data:text/html,<h1>Hello</h1>')).toThrow(InvalidUrlError);
  });

  it('should reject empty or malformed strings with InvalidUrlError', () => {
    expect(() => TargetUrl.create('')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('   ')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('not-a-url')).toThrow(InvalidUrlError);
  });

  it('should reject URLs with embedded user credentials', () => {
    expect(() => TargetUrl.create('https://user:password@example.com')).toThrow(InvalidUrlError);
  });

  it('should reject SSRF attacks to localhost and local domains', () => {
    expect(() => TargetUrl.create('http://localhost:3000')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://app.localhost')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://service.local')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://internal.service.internal')).toThrow(InvalidUrlError);
  });

  it('should reject SSRF attacks to private IPv4 ranges (RFC 1918 & Loopback)', () => {
    // 127.0.0.0/8 (Loopback)
    expect(() => TargetUrl.create('http://127.0.0.1:8080')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://127.0.0.2')).toThrow(InvalidUrlError);

    // 10.0.0.0/8
    expect(() => TargetUrl.create('http://10.0.0.1/admin')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://10.254.254.254')).toThrow(InvalidUrlError);

    // 172.16.0.0/12
    expect(() => TargetUrl.create('http://172.16.0.1')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://172.31.255.255')).toThrow(InvalidUrlError);

    // 192.168.0.0/16
    expect(() => TargetUrl.create('http://192.168.1.1/router')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://192.168.0.254')).toThrow(InvalidUrlError);
  });

  it('should reject SSRF attacks to Cloud Instance Metadata (169.254.169.254)', () => {
    expect(() =>
      TargetUrl.create('http://169.254.169.254/latest/meta-data/'),
    ).toThrow(InvalidUrlError);
  });

  it('should reject SSRF attacks to IPv6 loopback and unique local addresses', () => {
    expect(() => TargetUrl.create('http://[::1]')).toThrow(InvalidUrlError);
    expect(() => TargetUrl.create('http://[fc00::1]')).toThrow(InvalidUrlError);
  });

  it('should support equality comparison', () => {
    const url1 = TargetUrl.create('https://example.com/path');
    const url2 = TargetUrl.create('https://example.com/path');
    const url3 = TargetUrl.create('https://example.com/other');

    expect(url1.equals(url2)).toBe(true);
    expect(url1.equals(url3)).toBe(false);
  });
});
