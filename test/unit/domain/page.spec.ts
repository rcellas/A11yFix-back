import { describe, it, expect } from 'vitest';
import { Page } from '../../../src/domain/audit/page';
import { TargetUrl } from '../../../src/domain/audit/target-url';

describe('Page Domain Entity', () => {
  it('should instantiate page with url, title, and inspectedAt', () => {
    const url = TargetUrl.create('https://example.com/checkout');
    const inspectedAt = new Date('2026-09-02T22:00:00.000Z');
    const page = Page.create({
      url,
      title: 'Checkout Flow',
      domSnapshotSnippet: '<html><body><main></main></body></html>',
      inspectedAt,
    });

    expect(page.url.value).toBe('https://example.com/checkout');
    expect(page.title).toBe('Checkout Flow');
    expect(page.domSnapshotSnippet).toBe('<html><body><main></main></body></html>');
    expect(page.inspectedAt).toEqual(inspectedAt);
  });

  it('should trim page title and default inspectedAt to now', () => {
    const url = TargetUrl.create('https://example.com');
    const page = Page.create({
      url,
      title: '  Home Page  ',
    });

    expect(page.title).toBe('Home Page');
    expect(page.inspectedAt).toBeInstanceOf(Date);
  });

  it('should serialize cleanly to JSON', () => {
    const url = TargetUrl.create('https://example.com');
    const page = Page.create({ url, title: 'Home' });
    const json = page.toJSON();

    expect(json.url).toBe('https://example.com/');
    expect(json.title).toBe('Home');
    expect(typeof json.inspectedAt).toBe('string');
  });
});
