# A11yFix API — Agent Working Agreements & Repository Guide

Welcome to the **A11yFix API** repository (`a11yfix-api`). This document governs all autonomous and pair-programming agents operating on this codebase.

---

## 1. Core Mission & Architectural Invariants

A11yFix is an agent-native accessibility QA platform backend. The backend provides audit orchestration, URL inspection, browser automation (Playwright), accessibility analysis (axe-core + DOM/focus/keyboard inspection), accessibility pattern analysis (WAI-ARIA design patterns), remediation proposals, verification, and Playwright regression test generation.

### Immutable Architecture Rules (Hexagonal Architecture / Ports and Adapters)
```text
Dependency Rule: Infrastructure → Application → Domain
```
1. **Framework-Free Core**:
   - `src/domain/` and `src/application/` MUST NEVER import or depend on `@nestjs/*`, `playwright`, `axe-core`, `better-sqlite3`, or HTTP/transport libraries.
   - NestJS decorators (`@Injectable`, `@Controller`, `@Module`, `@Param`, etc.) are STRICTLY PROHIBITED in Domain and Application layers.
   - The core domain and use cases must be 100% portable to other platforms (such as a future Spring Boot migration) without rewriting business logic.
2. **Ports Define Boundaries**:
   - Application use cases depend solely on Port interfaces (`src/application/ports/`).
   - Driven adapters (`src/infrastructure/persistence/`, `src/infrastructure/browser/`, `src/infrastructure/accessibility/`) implement these ports.
   - Driving adapters (`src/infrastructure/http/`) invoke use cases.
3. **No WebMCP in Backend**:
   - WebMCP belongs exclusively to the frontend repository (`a11yfix-web`).
   - The backend is a standard, robust REST API that frontend WebMCP tools consume. Do not implement WebMCP browser tool registration in this repository.
4. **No Genkit in MVP**:
   - Do not introduce Genkit. If AI orchestration is introduced later, it will be placed behind an explicit application port.
5. **SSRF Defense-in-Depth**:
   - Never allow arbitrary network requests to internal, loopback, private IPv4/IPv6, or metadata IP ranges. All target URLs must be validated before invocation.

---

## 2. Directory Structure

```text
src/
├── domain/                  # 100% pure TypeScript business models & rules
│   ├── audit/               # Audit aggregate, AuditId, AuditStatus, Page
│   ├── pattern/             # AccessibilityPattern interface, registry, P-01..P-04
│   ├── finding/             # Finding aggregate, FindingId, Severity, ElementRef
│   ├── remediation/         # FixProposal, Approval, Remediation aggregate, RemediationStatus
│   ├── verification/        # Verification result, VerificationStatus
│   └── regression-test/     # RegressionTest entity, semantic selector model
│
├── application/             # Application orchestration & use case contracts
│   ├── use-cases/           # CreateAudit, GetAudit, InspectPattern, ProposeRemediation, ApplyRemediation, VerifyRemediation, GenerateRegressionTest
│   ├── ports/               # Driving & Driven ports (Repositories, BrowserInspector, PatternRegistry, etc.)
│   ├── dto/                 # Input/Output DTOs for use cases
│   └── services/            # Domain-spanning orchestrators
│
├── infrastructure/          # Adapters & Framework delivery
│   ├── http/                # NestJS controllers, DTOs, OpenAPI decorators, filters, interceptors
│   ├── browser/             # Playwright adapter implementing BrowserInspectorPort
│   ├── accessibility/       # axe-core + DOM/keyboard/focus analyzer adapter
│   ├── persistence/         # SQLite repositories implementing persistence ports
│   └── ioc/                 # NestJS dependency injection wiring use cases with adapters
│
└── config/                  # Validated environment configuration (Zod)
```

---

## 3. Git Strategy & Branching Model

- `main`: Represents the latest production-validated release.
- `dev`: Primary integration branch for completed and validated features.
- Never commit directly to `main` or `dev`.
- Branch naming convention:
  - Features: `feat/TXXX-description` (or `feat/description` for foundational tasks)
  - Bug fixes: `fix/TXXX-description`
  - Documentation: `docs/description`
  - Specifications: `spec/description`
- Commit convention: [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat(audit): implement create audit use case`
  - `test(pattern): add dialog focus trap tests`
  - `fix(security): prevent dns rebinding in url validator`
  - `docs(adr): document sqlite portability rationale`

---

## 4. Development Workflow & Quality Gates

Every task must follow Test-First / Test-Driven Development (TDD):
```text
Requirement → Acceptance Criteria → Test → Implementation → Verification
```

### Quality Gates (MANDATORY before merging)
1. `pnpm typecheck` (0 TypeScript errors in strict mode)
2. `pnpm lint` (0 ESLint warnings or errors, boundary rules verified)
3. `pnpm test` (All unit tests passing)
4. `pnpm test:int` (All integration tests passing)
5. `pnpm build` (Clean production build without compilation errors)
6. No unresolved TODOs, stubs, or fake mocks in production code.

---

## 5. Technology Stack Summary

- **Runtime & Language**: Node.js >= 22, TypeScript 5.x (Strict Mode)
- **Package Manager**: `pnpm`
- **Framework (Delivery Layer Only)**: NestJS 11.x (`@nestjs/core`, `@nestjs/common`, `@nestjs/platform-express`, `@nestjs/swagger`)
- **Testing**: Vitest (`vitest`, `@swc/core`, `unplugin-swc`)
- **Browser Automation**: Playwright (`@playwright/test`)
- **Accessibility Engine**: `axe-core` + custom DOM/focus/keyboard analyzers
- **Persistence**: SQLite (`better-sqlite3` + SQL schema migrations)
- **Validation**: `zod` for configuration and boundary contracts
- **API Documentation**: OpenAPI / Swagger (`@nestjs/swagger`)
