import { PatternType, PatternTypeValue } from './pattern-type';
import { AccessibilityPattern } from './accessibility-pattern.interface';
import { PatternContext, DetectionResult } from './pattern-context';
import {
  PatternNotSupportedError,
  PatternAlreadyRegisteredError,
} from '../errors/domain.error';

export interface PatternMatch {
  pattern: AccessibilityPattern;
  result: DetectionResult;
}

/**
 * Registry for dynamically registering, retrieving, and dispatching accessibility patterns.
 * Follows the Open-Closed Principle: new patterns are registered as autonomous plugins.
 */
export class PatternRegistry {
  private readonly _patterns = new Map<PatternTypeValue, AccessibilityPattern>();

  /**
   * Registers an accessibility pattern plugin.
   * Throws PatternAlreadyRegisteredError if a pattern for the type is already present.
   */
  public register(pattern: AccessibilityPattern): void {
    const key = pattern.type.value;
    if (this._patterns.has(key)) {
      throw new PatternAlreadyRegisteredError(key);
    }
    this._patterns.set(key, pattern);
  }

  /**
   * Retrieves a pattern plugin by PatternType or string value.
   */
  public get(type: PatternType | string): AccessibilityPattern | undefined {
    const key = (typeof type === 'string' ? type.toUpperCase() : type.value) as PatternTypeValue;
    return this._patterns.get(key);
  }

  /**
   * Retrieves a pattern plugin or throws PatternNotSupportedError if not found.
   */
  public getOrThrow(type: PatternType | string): AccessibilityPattern {
    const pattern = this.get(type);
    if (!pattern) {
      const key = typeof type === 'string' ? type : type.value;
      throw new PatternNotSupportedError(key);
    }
    return pattern;
  }

  /**
   * Checks if a pattern is registered for the specified type.
   */
  public has(type: PatternType | string): boolean {
    return this.get(type) !== undefined;
  }

  /**
   * Returns all registered pattern plugins.
   */
  public getAll(): AccessibilityPattern[] {
    return Array.from(this._patterns.values());
  }

  /**
   * Evaluates all registered patterns against a DOM context.
   * Returns matches sorted descending by detection confidence.
   */
  public detectAll(context: PatternContext): PatternMatch[] {
    const matches: PatternMatch[] = [];

    for (const pattern of this._patterns.values()) {
      const result = pattern.detect(context);
      if (result.detected) {
        matches.push({ pattern, result });
      }
    }

    return matches.sort((a, b) => b.result.confidence - a.result.confidence);
  }

  /**
   * Clears all registered patterns (useful for test isolation).
   */
  public clear(): void {
    this._patterns.clear();
  }
}
