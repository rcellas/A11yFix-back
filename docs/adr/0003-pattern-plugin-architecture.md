# ADR 0003: Plugin/Registry Architecture for Accessibility Patterns

## Status
Accepted

## Context
A11yFix elevates accessibility patterns to first-class domain concepts. Initial patterns include:
- **P-01**: Dialog (Modal / Non-modal)
- **P-02**: Tabs
- **P-03**: Disclosure / Accordion
- **P-04**: Combobox

Each pattern specifies custom semantic requirements, accessible naming, ARIA states, keyboard flows (e.g., arrow key navigation, Tab trapping, Escape dismissal), fix proposals, and behavioral verification logic.
Implementing pattern handling as a monolithic service or a gigantic `switch (patternType)` statement leads to high coupling, code fragility, and violation of the Open-Closed Principle.

## Decision
We implement a **Registry / Plugin Architecture** for accessibility patterns:
1. Define a core domain interface:
   ```typescript
   export interface AccessibilityPattern {
     readonly type: PatternType;
     detect(context: PatternContext): DetectionResult;
     inspect(context: PatternContext): PatternAudit;
     proposeFix(finding: PatternFinding): FixProposal[];
     verify(finding: PatternFinding, executionContext: ExecutionContext): VerificationResult;
   }
   ```
2. Implement each pattern as an isolated, single-responsibility module:
   - `src/domain/pattern/patterns/dialog.pattern.ts`
   - `src/domain/pattern/patterns/tabs.pattern.ts`
   - `src/domain/pattern/patterns/disclosure.pattern.ts`
   - `src/domain/pattern/patterns/combobox.pattern.ts`
3. Provide a domain `PatternRegistry` that registers, discovers, and routes pattern operations dynamically by `PatternType`.

## Consequences
### Positive
- High cohesion and separation of concerns: each pattern is self-contained with its own tests.
- Extensibility: new patterns (e.g. Menu, Treeview, Slider) can be added by implementing `AccessibilityPattern` without modifying existing pattern code.
- Testability: pattern behaviors can be tested in isolation with mocked DOM/context fixtures.

### Negative / Trade-offs
- Requires uniform abstraction over pattern-specific attributes and execution contexts.
