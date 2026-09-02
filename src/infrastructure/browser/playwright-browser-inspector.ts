import { chromium, Browser, BrowserContext, Page } from 'playwright';
import {
  BrowserInspectorPort,
  BrowserSession,
  DomElementSnapshot,
  FocusSnapshot,
  KeyboardResult,
  KeyboardSequence,
} from '../../application/ports/browser-inspector.port';
import { TargetUrl } from '../../domain/audit/target-url';

interface SessionData {
  context: BrowserContext;
  page: Page;
  url: string;
}

/**
 * Playwright adapter implementing BrowserInspectorPort.
 * Isolated in infrastructure layer.
 */
export class PlaywrightBrowserInspector implements BrowserInspectorPort {
  private browser: Browser | null = null;
  private readonly sessions = new Map<string, SessionData>();

  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
    }
    return this.browser;
  }

  public async open(url: TargetUrl): Promise<BrowserSession> {
    const browser = await this.getBrowser();
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
      userAgent: 'A11yFix-AuditEngine/1.0 (Accessibility QA Platform)',
    });
    const page = await context.newPage();

    await page.goto(url.value, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const sessionId = crypto.randomUUID();
    const session: BrowserSession = {
      id: sessionId,
      url: url.value,
    };

    this.sessions.set(sessionId, { context, page, url: url.value });

    return session;
  }

  public async close(session: BrowserSession): Promise<void> {
    const data = this.sessions.get(session.id);
    if (data) {
      await data.context.close().catch(() => undefined);
      this.sessions.delete(session.id);
    }
  }

  public async closeAll(): Promise<void> {
    for (const [, data] of this.sessions) {
      await data.context.close().catch(() => undefined);
    }
    this.sessions.clear();
    if (this.browser) {
      await this.browser.close().catch(() => undefined);
      this.browser = null;
    }
  }

  public getPage(session: BrowserSession): Page {
    const data = this.sessions.get(session.id);
    if (!data) {
      throw new Error(`Browser session "${session.id}" not found.`);
    }
    return data.page;
  }

  public async inspectDom(
    session: BrowserSession,
    selector = 'body',
  ): Promise<DomElementSnapshot> {
    const page = this.getPage(session);

    return page.evaluate((sel: string) => {
      const el = document.querySelector(sel);
      if (!el) {
        throw new Error(`Element with selector "${sel}" not found.`);
      }

      const attrs: Record<string, string> = {};
      for (let i = 0; i < el.attributes.length; i++) {
        const a = el.attributes[i];
        attrs[a.name] = a.value;
      }

      const childrenSnapshots: DomElementSnapshot[] = [];
      for (let i = 0; i < el.children.length; i++) {
        const c = el.children[i];
        const childAttrs: Record<string, string> = {};
        for (let j = 0; j < c.attributes.length; j++) {
          const ca = c.attributes[j];
          childAttrs[ca.name] = ca.value;
        }
        childrenSnapshots.push({
          tagName: c.tagName.toLowerCase(),
          attributes: childAttrs,
          outerHtml: c.outerHTML.slice(0, 500),
          role: c.getAttribute('role') || undefined,
          accessibleName: c.getAttribute('aria-label') || undefined,
        });
      }

      return {
        tagName: el.tagName.toLowerCase(),
        attributes: attrs,
        role: el.getAttribute('role') || undefined,
        accessibleName: el.getAttribute('aria-label') || undefined,
        outerHtml: el.outerHTML.slice(0, 1000),
        textContent: el.textContent?.trim() || undefined,
        children: childrenSnapshots,
      };
    }, selector);
  }

  public async runKeyboardFlow(
    session: BrowserSession,
    flow: KeyboardSequence,
  ): Promise<KeyboardResult> {
    const page = this.getPage(session);
    const dispatchedKeys: string[] = [];

    for (const key of flow.keys) {
      await page.keyboard.press(key);
      dispatchedKeys.push(key);
      if (flow.delayMs) {
        await page.waitForTimeout(flow.delayMs);
      }
    }

    const focusSnapshot = await this.inspectFocus(session);

    return {
      dispatchedKeys,
      activeElementAfter: focusSnapshot.activeElement,
      focusTrapped: Boolean(focusSnapshot.activeElement),
    };
  }

  public async inspectFocus(session: BrowserSession): Promise<FocusSnapshot> {
    const page = this.getPage(session);

    return page.evaluate(() => {
      const active = document.activeElement;
      if (!active || active === document.body) {
        return { focusedSelector: 'body' };
      }

      const attrs: Record<string, string> = {};
      for (let i = 0; i < active.attributes.length; i++) {
        const a = active.attributes[i];
        attrs[a.name] = a.value;
      }

      return {
        focusedSelector: active.id ? `#${active.id}` : active.tagName.toLowerCase(),
        activeElement: {
          tagName: active.tagName.toLowerCase(),
          attributes: attrs,
          outerHtml: active.outerHTML.slice(0, 500),
          role: active.getAttribute('role') || undefined,
          accessibleName: active.getAttribute('aria-label') || undefined,
        },
      };
    });
  }
}
