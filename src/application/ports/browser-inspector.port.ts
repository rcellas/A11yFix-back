import { TargetUrl } from '../../domain/audit/target-url';
import { DomElementSnapshot } from '../../domain/pattern/pattern-context';

export interface BrowserSession {
  id: string;
  url: string;
}

export interface FocusSnapshot {
  activeElement?: DomElementSnapshot;
  focusedSelector?: string;
}

export interface KeyboardSequence {
  keys: string[];
  delayMs?: number;
}

export interface KeyboardResult {
  dispatchedKeys: string[];
  activeElementAfter?: DomElementSnapshot;
  focusTrapped?: boolean;
}

/**
 * Driven port interface for server-side browser automation and DOM inspection.
 * Decoupled from Playwright or any specific browser runtime.
 */
export interface BrowserInspectorPort {
  open(url: TargetUrl): Promise<BrowserSession>;
  close(session: BrowserSession): Promise<void>;
  inspectDom(session: BrowserSession, selector?: string): Promise<DomElementSnapshot>;
  runKeyboardFlow(session: BrowserSession, flow: KeyboardSequence): Promise<KeyboardResult>;
  inspectFocus(session: BrowserSession): Promise<FocusSnapshot>;
}

export const BROWSER_INSPECTOR_PORT = Symbol('BROWSER_INSPECTOR_PORT');
