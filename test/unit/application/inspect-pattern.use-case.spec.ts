import { describe, it, expect, beforeEach } from 'vitest';
import { InspectPatternUseCase } from '../../../src/application/use-cases/inspect-pattern.use-case';
import { PatternRegistry } from '../../../src/domain/pattern/pattern-registry';
import { DialogPattern } from '../../../src/domain/pattern/dialog.pattern';
import { TabsPattern } from '../../../src/domain/pattern/tabs.pattern';
import { DisclosurePattern } from '../../../src/domain/pattern/disclosure.pattern';
import { ComboboxPattern } from '../../../src/domain/pattern/combobox.pattern';

describe('InspectPatternUseCase', () => {
  let registry: PatternRegistry;
  let useCase: InspectPatternUseCase;

  beforeEach(() => {
    registry = new PatternRegistry();
    registry.register(new DialogPattern());
    registry.register(new TabsPattern());
    registry.register(new DisclosurePattern());
    registry.register(new ComboboxPattern());

    useCase = new InspectPatternUseCase(registry);
  });

  it('should inspect specific pattern when patternType is provided', async () => {
    const results = await useCase.execute({
      patternType: 'DIALOG',
      targetElement: {
        tagName: 'div',
        attributes: { role: 'dialog', class: 'modal' },
        outerHtml: '<div role="dialog" class="modal"></div>',
      },
    });

    expect(results).toHaveLength(1);
    expect(results[0].patternType).toBe('DIALOG');
    expect(results[0].passed).toBe(false); // missing accessible name
    expect(results[0].violations.some((v) => v.ruleId === 'pattern:dialog-accessible-name')).toBe(true);
  });

  it('should detect and inspect all matching patterns when patternType is omitted', async () => {
    const results = await useCase.execute({
      targetElement: {
        tagName: 'button',
        attributes: { 'aria-expanded': 'true', 'aria-controls': 'panel' },
        accessibleName: 'Toggle Panel',
        outerHtml: '<button aria-expanded="true" aria-controls="panel">Toggle Panel</button>',
      },
    });

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results[0].patternType).toBe('DISCLOSURE');
    expect(results[0].passed).toBe(true);
  });

  it('should return empty results when no patterns match generic element', async () => {
    const results = await useCase.execute({
      targetElement: {
        tagName: 'span',
        attributes: {},
        outerHtml: '<span>Simple text</span>',
      },
    });

    expect(results).toHaveLength(0);
  });
});
