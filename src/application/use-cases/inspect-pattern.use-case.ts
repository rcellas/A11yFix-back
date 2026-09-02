import { PatternRegistry } from '../../domain/pattern/pattern-registry';
import { InspectPatternInput, PatternInspectionOutput } from '../dto/pattern.dto';
import { PatternContext } from '../../domain/pattern/pattern-context';

/**
 * Use case: Inspects a DOM element snapshot against WAI-ARIA pattern plugins.
 * 100% pure TypeScript, zero framework dependencies.
 */
export class InspectPatternUseCase {
  constructor(private readonly patternRegistry: PatternRegistry) {}

  public async execute(input: InspectPatternInput): Promise<PatternInspectionOutput[]> {
    const context: PatternContext = {
      targetElement: input.targetElement,
    };

    // If explicit pattern requested, inspect directly
    if (input.patternType) {
      const pattern = this.patternRegistry.getOrThrow(input.patternType);
      const audit = pattern.inspect(context);

      return [
        {
          patternType: pattern.type.value,
          passed: audit.passed,
          violations: audit.violations.map((v) => ({
            ruleId: v.ruleId,
            message: v.message,
            severity: v.severity.value,
            targetSelector: v.targetSelector.toJSON(),
            htmlSnippet: v.htmlSnippet,
            helpUrl: v.helpUrl,
          })),
          inspectedAt: audit.inspectedAt.toISOString(),
        },
      ];
    }

    // Otherwise, detect all applicable patterns and inspect each
    const matches = this.patternRegistry.detectAll(context);
    const results: PatternInspectionOutput[] = [];

    for (const match of matches) {
      const audit = match.pattern.inspect(context);
      results.push({
        patternType: match.pattern.type.value,
        passed: audit.passed,
        violations: audit.violations.map((v) => ({
          ruleId: v.ruleId,
          message: v.message,
          severity: v.severity.value,
          targetSelector: v.targetSelector.toJSON(),
          htmlSnippet: v.htmlSnippet,
          helpUrl: v.helpUrl,
        })),
        inspectedAt: audit.inspectedAt.toISOString(),
      });
    }

    return results;
  }
}
