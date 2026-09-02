# A11yFix Architectural Constitution

This document defines the non-negotiable architectural principles, constraints, and invariants governing the **A11yFix API** system.

---

## Article I: The Inviolable Hexagonal Boundary

1. **Dependency Direction**:
   $$\text{Infrastructure} \longrightarrow \text{Application} \longrightarrow \text{Domain}$$
   Dependencies point inward. The `Domain` layer depends on nothing. The `Application` layer depends only on the `Domain`. The `Infrastructure` layer depends on `Application` and `Domain`.
2. **Framework Decoupling**:
   - The `Domain` and `Application` layers must remain 100% free of framework decorators, annotations, base classes, or runtime dependencies (`@nestjs/*`, `playwright`, `axe-core`, `better-sqlite3`, `express`).
   - Use cases must be pure TypeScript classes instantiated with explicit port implementations in their constructor.
3. **Future Framework Portability**:
   - The application and domain logic must be so cleanly isolated that they can be ported to Spring Boot (or any modern backend framework) without altering business logic, invariants, or domain models.

---

## Article II: The Core Workflow

Every accessibility operation conforms to the 7-stage pipeline:
```text
Detect ──► Understand ──► Propose ──► Approve ──► Fix ──► Verify ──► Prevent Regression
```
1. **Detect**: Automated broad-spectrum checks using `axe-core` and DOM heuristics.
2. **Understand**: Pattern matching against WAI-ARIA design patterns (Dialog, Tabs, Disclosure, Combobox).
3. **Propose**: Generate explicit, non-destructive fix proposals (`FixProposal`).
4. **Approve**: Strict boundary. No mutation or remediation may be executed without an explicit `Approval`.
5. **Fix**: Apply targeted remediation strategies based on approved proposals.
6. **Verify**: Execute rigorous behavioral verification (DOM state, keyboard flow, focus management). Absence of errors is not verification; positive behavioral confirmation is required.
7. **Prevent Regression**: Synthesize deterministic, semantic Playwright tests (`getByRole`, `getByLabel`, `getByText`) preserving accessible behavior in CI/CD.

---

## Article III: Pattern Plugin Model

1. **Patterns as First-Class Citizens**:
   - Accessibility patterns (P-01 Dialog, P-02 Tabs, P-03 Disclosure, P-04 Combobox) are modeled as autonomous plugins implementing `AccessibilityPattern`.
   - Never use a monolithic `switch` statement for pattern behavior.
2. **Pattern Responsibilities**:
   Each pattern encapsulates:
   - Detection heuristics
   - State & ARIA inspection
   - Keyboard interaction flows
   - Focus management validation
   - Fix proposal strategies
   - Verification assertions
3. **Open-Closed Principle**:
   Adding a new pattern (e.g. P-05 Menu, P-06 Treeview) requires implementing the pattern interface and registering it with the `PatternRegistry`. Zero changes to existing pattern code.

---

## Article IV: Security & SSRF Defense-in-Depth

1. **Restricted Protocols**:
   Only `http:` and `https:` schemes are permitted. All others (`file:`, `ftp:`, `gopher:`, `data:`, `javascript:`, etc.) are unconditionally rejected.
2. **IP & Hostname Blacklisting**:
   The backend must resolve and evaluate destination hosts before dispatching browser instances:
   - Loopback: `127.0.0.0/8`, `::1`
   - Private IPv4 (RFC 1918): `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`
   - Link-Local: `169.254.0.0/16`, `fe80::/10`
   - Unique Local IPv6: `fc00::/7`
   - Cloud Metadata Services: `169.254.169.254`
   - Reserved & Multicast: `224.0.0.0/4`, `240.0.0.0/4`, `::ffff:0:0/96`
   - Local domains: `*.localhost`, `*.local`, `*.internal`, `*.lan`
3. **Redirect Protection**:
   Browser navigation must intercept and re-verify every redirect destination against SSRF policies.

---

## Article V: Testing & Verification Rigor

1. **Test-First Development (TDD)**:
   Every feature and bug fix begins with unit/acceptance tests. Code without tests will not be merged.
2. **Deterministic Verification**:
   Verification must test actual interaction states (focus traps, tab key sequences, `aria-expanded` transitions), not merely static HTML attributes.
3. **Semantic Regression Tests**:
   Generated Playwright tests must avoid fragile CSS selectors or dynamic XPath. They must utilize accessible user-centric locators: `page.getByRole(...)`, `page.getByLabel(...)`, and `page.getByText(...)`.

---

## Article VI: Persistence Portability

1. **Zero Domain Leakage**:
   The SQLite persistence engine is strictly an adapter detail. No database connection pools, queries, or SQLite types may surface beyond `src/infrastructure/persistence/`.
2. **Durability Agnosticism**:
   Because SQLite is deployed in budget-conscious / ephemeral environments, the application must be designed so that persistence resetting does not break runtime contracts or development workflows.

---

## Article VII: Git & Delivery Discipline

1. **Protected Branches**:
   - `main`: Production-ready release state.
   - `dev`: Active integration trunk.
   - Direct commits to `main` and `dev` are strictly forbidden.
2. **Branch Naming**:
   - Feature branches: `feat/TXXX-name` or `feat/name`
   - Fix branches: `fix/TXXX-name`
   - Specs & Architecture: `spec/XXX-name`
3. **Quality Gates**:
   A pull request or merge requires clean execution of type checking, linting with boundary verification, unit tests, and integration tests.
