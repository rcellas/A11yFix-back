import { describe, it, expect } from 'vitest';
import { TargetUrl } from '../../../src/domain/audit/target-url';
import { InvalidUrlError } from '../../../src/domain/errors/domain.error';

describe('TargetUrl Value Object', () => {
  it('should accept valid HTTPS and HTTP URLs', () => {
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

  it('should support equality comparison', () => {
    const url1 = TargetUrl.create('https://example.com/path');
    const url2 = TargetUrl.create('https://example.com/path');
    const url3 = TargetUrl.create('https://example.com/other');

    expect(url1.equals(url2)).toBe(true);
    expect(url1.equals(url3)).toBe(false);
  });
});
