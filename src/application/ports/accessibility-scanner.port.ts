import { BrowserSession } from './browser-inspector.port';
import { Severity } from '../../domain/finding/severity';
import { ElementSelector } from '../../domain/finding/element-selector';

export interface RawScanViolation {
  ruleId: string;
  message: string;
  severity: Severity;
  helpUrl?: string;
  targetSelector: ElementSelector;
  htmlSnippet: string;
}

/**
 * Driven port interface for broad-spectrum static accessibility scanning (e.g. axe-core).
 */
export interface AccessibilityScannerPort {
  scan(session: BrowserSession): Promise<RawScanViolation[]>;
}

export const ACCESSIBILITY_SCANNER_PORT = Symbol('ACCESSIBILITY_SCANNER_PORT');
