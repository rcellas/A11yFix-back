# ADR 0005: Playwright & axe-core Segregated Accessibility Engine

## Status
Accepted

## Context
Accessibility auditing requires both static WCAG rule checks and dynamic interaction validation (such as focus traps, keyboard navigation, and ARIA state transitions). Relying solely on `axe-core` is insufficient because axe-core only checks static DOM states at one point in time and cannot evaluate dynamic interaction flows or complex composite widget behavior. Conversely, building a custom scanner from scratch would reinvent hundreds of standard WCAG rules.

## Decision
We separate concerns into dedicated components orchestrated via application ports:

1. **Static Analysis (`axe-core`)**:
   - Executes standard WCAG 2.1 / 2.2 AA rules via `@axe-core/playwright`.
   - Generates standard accessibility violations (color contrast, missing labels, incorrect ARIA attributes).
2. **Dynamic Behavioral Inspection (`BrowserInspectorPort`)**:
   - Implemented via Playwright in `src/infrastructure/browser/playwright/`.
   - Inspects active DOM, handles element focus testing, dispatches keyboard sequences (Tab, Shift+Tab, Escape, Enter, Arrows), and captures screenshots.
3. **Pattern Engine (`AccessibilityPattern`)**:
   - Combines static findings and dynamic browser state to evaluate WAI-ARIA authoring practices.
   - Evaluates pattern invariants (e.g. "Does closing the dialog restore focus to the triggering element?").
4. **Driven Ports**:
   - `AccessibilityScannerPort`: runs axe-core scans.
   - `BrowserInspectorPort`: executes browser interactions and retrieves runtime DOM/focus snapshots.

## Consequences
### Positive
- Best of both worlds: industry-standard axe-core coverage plus bespoke dynamic behavioral pattern analysis.
- Clear separation between scanning and browser automation.
- Testable with synthetic HTML fixtures in unit and integration test suites.

### Negative / Trade-offs
- Running a headless browser instance incurs non-negligible CPU/memory consumption per audit. Mitigated via browser context pooling and page timeouts.
