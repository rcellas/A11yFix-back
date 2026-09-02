# Architecture & Technical Implementation Plan

**Specification ID**: `SPEC-001`  
**Document**: Implementation Plan  

---

## 1. Architectural Blueprint: Ports & Adapters

```text
                               ┌─────────────────────────────┐
                               │        Domain Layer         │
                               │  - Aggregates (Audit, etc.) │
                               │  - Pattern Plugins (P01-04) │
                               │  - Value Objects & Errors   │
                               └──────────────▲──────────────┘
                                              │
                               ┌──────────────┴──────────────┐
                               │      Application Layer      │
                               │  - Use Cases                │
                               │  - Ports (SPI Interfaces)   │
                               │  - DTOs                     │
                               └──────────────▲──────────────┘
                                              │
                  ┌───────────────────────────┴───────────────────────────┐
                  │                                                       │
    ┌─────────────┴─────────────┐                           ┌─────────────┴─────────────┐
    │     Driving Adapters      │                           │      Driven Adapters      │
    │  - NestJS HTTP Controllers│                           │  - SQLite Repositories    │
    │  - OpenAPI / Swagger      │                           │  - Playwright Browser     │
    │  - Request Validation     │                           │  - axe-core Scanner       │
    └───────────────────────────┘                           └───────────────────────────┘
```

---

## 2. Layer Definitions & Directory Mapping

### 2.1 `src/domain`
- **`audit/`**: `Audit` aggregate root, `AuditId`, `AuditStatus`, `TargetUrl`, `Page`.
- **`pattern/`**: `AccessibilityPattern` interface, `PatternRegistry`, `PatternContext`, and pattern implementations:
  - `dialog.pattern.ts` (P-01)
  - `tabs.pattern.ts` (P-02)
  - `disclosure.pattern.ts` (P-03)
  - `combobox.pattern.ts` (P-04)
- **`finding/`**: `Finding` aggregate root, `FindingId`, `Severity`, `ElementSelector`.
- **`remediation/`**: `Remediation` aggregate root, `RemediationId`, `FixProposal`, `Approval`, `RemediationStatus`.
- **`verification/`**: `VerificationResult`, `VerificationStatus`, `VerificationCheck`.
- **`regression-test/`**: `RegressionTest`, `PlaywrightTestScript`, semantic locator helpers.
- **`errors/`**: Pure domain error definitions (`DomainError`, `InvalidUrlError`, `ForbiddenTargetError`, `ApprovalRequiredError`, `PatternNotSupportedError`).

### 2.2 `src/application`
- **`use-cases/`**:
  - `CreateAuditUseCase`
  - `GetAuditUseCase`
  - `GetFindingsUseCase`
  - `GetFindingUseCase`
  - `InspectPatternUseCase`
  - `ProposeRemediationUseCase`
  - `ApproveRemediationUseCase`
  - `ApplyRemediationUseCase`
  - `VerifyRemediationUseCase`
  - `GenerateRegressionTestUseCase`
- **`ports/`**:
  - `AuditRepositoryPort`
  - `FindingRepositoryPort`
  - `RemediationRepositoryPort`
  - `BrowserInspectorPort`
  - `AccessibilityScannerPort`
  - `RegressionTestGeneratorPort`
  - `PatternRegistryPort`
- **`dto/`**: Input and Output data structures for use cases.

### 2.3 `src/infrastructure`
- **`http/`**:
  - Controllers: `AuditController`, `FindingController`, `RemediationController`, `HealthController`.
  - Filters: `HttpExceptionFilter` (RFC 7807 Problem Details mapping).
  - DTOs: HTTP request bodies with class-validator/Zod.
  - Modules: `AuditModule`, `FindingModule`, `RemediationModule`, `AppModule`.
- **`persistence/sqlite/`**:
  - `SqliteAuditRepository`
  - `SqliteFindingRepository`
  - `SqliteRemediationRepository`
  - Database connection factory (`better-sqlite3`) and schema migration scripts.
- **`browser/playwright/`**:
  - `PlaywrightBrowserInspector` (headless Chrome execution, keyboard dispatch, focus traps).
- **`accessibility/axe/`**:
  - `AxeAccessibilityScanner` (`@axe-core/playwright` integration).
- **`ioc/`**:
  - Factory providers wiring use cases with concrete adapters.

---

## 3. Technology Stack & Tooling

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Language** | TypeScript 5.x | Strict typing, enterprise maintainability |
| **Runtime** | Node.js >= 22 | Native fetch, modern performance |
| **Package Manager**| pnpm 11.x | Fast, deterministic disk-efficient package management |
| **Framework** | NestJS 11.x | Delivery layer only (HTTP, OpenAPI, DI wiring) |
| **Unit Testing** | Vitest + SWC | Near-instant test execution |
| **Browser Engine** | Playwright | Headless browser execution and interaction |
| **Accessibility Engine** | axe-core + Custom | Static WCAG analysis + dynamic pattern validation |
| **Persistence** | SQLite (`better-sqlite3`)| Zero infrastructure cost, self-contained for MVP |
| **Validation** | Zod | Boundary validation, environment configuration |

---

## 4. Test Strategy

```text
Unit Tests (Domain & Application)
  ├── 100% pure TypeScript, zero I/O
  ├── Mock ports via simple test doubles
  └── Execution time: < 2 seconds

Integration Tests (Adapters)
  ├── SQLite repositories against in-memory SQLite (:memory:)
  ├── SSRF URL validator against real/virtual DNS resolution
  ├── Playwright against synthetic local HTML fixtures
  └── Execution time: < 30 seconds

End-to-End Tests (Critical Paths)
  ├── Full HTTP lifecycle: Create audit -> Findings -> Propose -> Approve -> Apply -> Verify -> Regression test
  └── Execution time: < 60 seconds
```
