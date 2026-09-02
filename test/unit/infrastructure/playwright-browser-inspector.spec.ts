import { describe, it, expect } from 'vitest';
import { PlaywrightBrowserInspector } from '../../../src/infrastructure/browser/playwright-browser-inspector';

describe('PlaywrightBrowserInspector', () => {
  it('should instantiate and throw when accessing non-existent session', () => {
    const inspector = new PlaywrightBrowserInspector();
    expect(() => inspector.getPage({ id: 'non-existent', url: 'https://example.com' })).toThrow(
      /Browser session "non-existent" not found/,
    );
  });
});
