# Work Breakdown Structure & Task Dependency Graph

**Specification ID**: `SPEC-001`  
**Document**: Task Breakdown & Implementation Roadmap  

---

## 1. Dependency Graph

```text
[T000 SDD Baseline & Architecture]
               │
               ▼
   [T001 Backend Bootstrap]
               │
               ▼
[T002 Domain IDs & Value Objects]
         ┌─────┴──────────────────────────┐
         ▼                                ▼
[T003 Audit Aggregate]          [T004 Finding Aggregate]
         │                                │
         │                     [T005 Pattern Registry]
         │                                │
         │           ┌────────────┬───────┴────────────┬────────────┐
         │           ▼            ▼                    ▼            ▼
         │      [T006 Dialog] [T007 Tabs]      [T008 Disclosure] [T009 Combobox]
         │           │            │                    │            │
         └───────────┼────────────┼────────────────────┼────────────┘
                     ▼            ▼                    ▼
               [T010 Application Use Cases & Ports]
                     │
         ┌───────────┼─────────────────────────┐
         ▼           ▼                         ▼
   [T011 SQLite] [T012 Playwright]      [T013 axe-core Engine]
         │           │                         │
         └───────────┼─────────────────────────┘
                     ▼
             [T014 HTTP REST API]
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   [T015 Remediation]      [T016 Verification]
         │                       │
         └───────────┬───────────┘
                     ▼
         [T017 Regression Test Gen]
                     │
                     ▼
         [T018 SSRF Security Hardening]
                     │
                     ▼
         [T019 Full Workflow Integration]
                     │
                     ▼
         [T020 Production & Containerization]
                     │
                     ▼
         [T021 Frontend Contract Validation]
```

---

## 2. Detailed Task Specifications

### `T000`: SDD Baseline & Architecture Documentation
- **Branch**: `feat/sdd-creation`
- **Prerequisites**: None
- **Deliverables**: `AGENTS.md`, `docs/constitution.md`, ADRs (`0001` to `0005`), `specs/001-a11yfix-api/*` (`spec.md`, `clarification.md`, `plan.md`, `tasks.md`).
- **Acceptance Criteria**: All architectural constraints, Hexagonal rules, and SDD documents committed and merged into `dev`.

---

### `T001`: Backend Bootstrap & Tooling Foundation
- **Branch**: `feat/T001-backend-bootstrap`
- **Prerequisites**: `T000`
- **Deliverables**:
  - `package.json` with pnpm, NestJS 11, TypeScript 5, Vitest, Zod, better-sqlite3.
  - `tsconfig.json` in strict mode with path aliases (`@domain/*`, `@application/*`, `@infrastructure/*`, `@config/*`).
  - `vitest.config.ts` configured for unit and integration testing.
  - `eslint.config.mjs` with import boundary enforcement (domain/application must not import infrastructure or framework).
  - NestJS bootstrap in `src/main.ts` with Swagger/OpenAPI setup.
  - `/health` endpoint in `src/infrastructure/http/controllers/health.controller.ts`.
  - GitHub Actions CI workflow (`.github/workflows/ci.yml`).
- **Acceptance Criteria**:
  - `pnpm typecheck` passes with 0 errors.
  - `pnpm lint` passes with boundary validation.
  - `pnpm test` executes and passes health unit test.
  - `pnpm build` generates clean `dist/` bundle.

---

### `T002`: Domain Identifiers & Value Objects
- **Branch**: `feat/T002-domain-identifiers`
- **Prerequisites**: `T001`
- **Deliverables**: `AuditId`, `FindingId`, `RemediationId`, `TargetUrl`, `Severity`, `PatternType`, `AuditStatus`, `RemediationStatus`, `VerificationStatus`.
- **Acceptance Criteria**: Pure TypeScript value objects with domain validation invariants and unit tests.

---

### `T003`: Audit Domain Aggregate
- **Branch**: `feat/T003-audit-domain`
- **Prerequisites**: `T002`
- **Deliverables**: `Audit` aggregate root, `AuditStatus` state machine, `Page` entity.
- **Acceptance Criteria**: Complete audit lifecycle state transitions (`created -> running -> completed | failed`) unit tested.

---

### `T004`: Finding Domain Aggregate
- **Branch**: `feat/T004-finding-domain`
- **Prerequisites**: `T002`
- **Deliverables**: `Finding` aggregate root, `ElementSelector`, violation severities.
- **Acceptance Criteria**: Unit tests verifying finding creation, selector normalization, and invariants.

---

### `T005`: Pattern Model & Registry
- **Branch**: `feat/T005-pattern-registry`
- **Prerequisites**: `T004`
- **Deliverables**: `AccessibilityPattern` interface, `PatternRegistry`, `PatternContext`.
- **Acceptance Criteria**: Registry dynamically registers, discovers, and routes patterns without switch statements.

---

### `T006`: Dialog Pattern (P-01)
- **Branch**: `feat/T006-dialog-pattern`
- **Prerequisites**: `T005`
- **Deliverables**: `DialogPattern` plugin implementing modal/non-modal inspection, focus trapping, and Escape key dismissal.
- **Acceptance Criteria**: Full unit tests against synthetic dialog DOM states.

---

### `T007`: Tabs Pattern (P-02)
- **Branch**: `feat/T007-tabs-pattern`
- **Prerequisites**: `T005`
- **Deliverables**: `TabsPattern` plugin implementing `tablist`, `tab`, `tabpanel`, arrow key navigation, and `aria-selected` validation.
- **Acceptance Criteria**: Unit tests verifying horizontal keyboard navigation and panel association.

---

### `T008`: Disclosure / Accordion Pattern (P-03)
- **Branch**: `feat/T008-disclosure-pattern`
- **Prerequisites**: `T005`
- **Deliverables**: `DisclosurePattern` plugin validating trigger button, `aria-expanded`, and linked panel visibility.
- **Acceptance Criteria**: Unit tests verifying toggle behavior and aria-controls consistency.

---

### `T009`: Combobox Pattern (P-04)
- **Branch**: `feat/T009-combobox-pattern`
- **Prerequisites**: `T005`
- **Deliverables**: `ComboboxPattern` plugin validating combobox input, listbox popup, and `aria-activedescendant`.
- **Acceptance Criteria**: Unit tests verifying popup lifecycle and selection events.

---

### `T010`: Application Use Cases & Ports
- **Branch**: `feat/T010-application-use-cases`
- **Prerequisites**: `T003`, `T004`, `T005`
- **Deliverables**: Use cases (`CreateAudit`, `GetAudit`, `GetFindings`, etc.) and port interfaces.
- **Acceptance Criteria**: Pure use case unit tests with mocked ports.

---

### `T011`: SQLite Persistence Adapter
- **Branch**: `feat/T011-sqlite-repositories`
- **Prerequisites**: `T010`
- **Deliverables**: `better-sqlite3` repositories implementing `AuditRepositoryPort`, `FindingRepositoryPort`, `RemediationRepositoryPort`.
- **Acceptance Criteria**: Integration tests executing against SQLite in-memory database (`:memory:`).

---

### `T012`: Browser Inspector Adapter (Playwright)
- **Branch**: `feat/T012-browser-inspector`
- **Prerequisites**: `T010`
- **Deliverables**: `PlaywrightBrowserInspector` implementing `BrowserInspectorPort`.
- **Acceptance Criteria**: Headless browser execution, keyboard dispatch, and focus trapping tests against local HTML fixtures.

---

### `T013`: Accessibility Engine Adapter (axe-core)
- **Branch**: `feat/T013-accessibility-engine`
- **Prerequisites**: `T010`
- **Deliverables**: `AxeAccessibilityScanner` integrating `@axe-core/playwright`.
- **Acceptance Criteria**: Static WCAG rule violation detection and mapper into `Finding` domain aggregates.

---

### `T014`: HTTP REST API & OpenAPI
- **Branch**: `feat/T014-http-api`
- **Prerequisites**: `T011`, `T012`, `T013`
- **Deliverables**: NestJS controllers, DTOs, OpenAPI spec, problem details exception filter.
- **Acceptance Criteria**: Supertest/e2e HTTP tests and complete Swagger documentation.

---

### `T015`: Remediation Domain & Use Cases
- **Branch**: `feat/T015-remediation`
- **Prerequisites**: `T014`
- **Deliverables**: `Remediation` aggregate, `FixProposal`, `ApproveRemediationUseCase`, `ApplyRemediationUseCase`.
- **Acceptance Criteria**: Approval enforcement tests (rejecting unapproved mutations).

---

### `T016`: Verification Domain & Behavioral Asserters
- **Branch**: `feat/T016-verification`
- **Prerequisites**: `T015`
- **Deliverables**: `VerifyRemediationUseCase`, behavioral checks for dialog focus restoration and tab state.
- **Acceptance Criteria**: Explicit `passed`/`failed` verification status tests.

---

### `T017`: Playwright Regression Test Generator
- **Branch**: `feat/T017-regression-test-generator`
- **Prerequisites**: `T016`
- **Deliverables**: `PlaywrightRegressionTestGenerator` using semantic selectors (`getByRole`, `getByLabel`, `getByText`).
- **Acceptance Criteria**: Generated test scripts validated and runnable by Playwright runner.

---

### `T018`: SSRF Defense-in-Depth Hardening
- **Branch**: `feat/T018-ssrf-hardening`
- **Prerequisites**: `T014`
- **Deliverables**: Host resolution validator, RFC 1918 / loopback / metadata blocklists, redirect interception.
- **Acceptance Criteria**: Security test suite attempting requests to 127.0.0.1, 169.254.169.254, [::1], and private ranges all safely rejected.

---

### `T019`: Full Lifecycle Integration Test Suite
- **Branch**: `feat/T019-lifecycle-integration`
- **Prerequisites**: `T017`, `T018`
- **Deliverables**: End-to-end integration test exercising the complete 7-stage workflow: Detect -> Understand -> Propose -> Approve -> Fix -> Verify -> Prevent Regression.
- **Acceptance Criteria**: Automated test passes consistently in CI environment.

---

### `T020`: Production Deployment & Containerization
- **Branch**: `feat/T020-production-deployment`
- **Prerequisites**: `T019`
- **Deliverables**: Multi-stage `Dockerfile`, production environment validation, health check probe integration.
- **Acceptance Criteria**: Container builds cleanly and passes liveness probes.

---

### `T021`: Frontend Contract Validation
- **Branch**: `feat/T021-frontend-contract`
- **Prerequisites**: `T020`
- **Deliverables**: OpenAPI schema export script (`pnpm export:openapi`), API client generation test for `a11yfix-web`.
- **Acceptance Criteria**: Validated compatibility with the consumer repository.
