# ADR 0001: Hexagonal Architecture (Ports and Adapters)

## Status
Accepted

## Context
A11yFix is an agent-native accessibility QA platform backend requiring longevity, modularity, and rapid evolution of scanning, browser automation, and persistence technologies. The initial implementation uses NestJS for delivery and dependency injection, but the business domain must be preserved independently of the framework to allow potential future migrations (e.g., to Spring Boot) and to safeguard business rules against framework churn.

## Decision
We adopt **Hexagonal Architecture (Ports and Adapters)** with the following layer rules:
1. **Domain Layer (`src/domain`)**:
   - Contains pure enterprise business models, aggregates, value objects, domain events, and domain specifications.
   - Zero external framework dependencies (no `@nestjs/*`, `playwright`, `axe-core`, `better-sqlite3`, etc.).
2. **Application Layer (`src/application`)**:
   - Contains application use cases, DTOs, and Port interfaces.
   - Use cases are pure TypeScript classes orchestrated via constructor-injected Port interfaces.
   - Zero framework dependencies.
3. **Infrastructure Layer (`src/infrastructure`)**:
   - **Driving Adapters**: NestJS controllers, guards, filters, interceptors, and OpenAPI swagger specifications.
   - **Driven Adapters**: Persistence (SQLite via `better-sqlite3`), Browser Automation (Playwright), Accessibility Engine (`axe-core` + DOM analyzers).
   - **IoC Container**: NestJS modules provide wire-up bindings linking ports to adapters.

```text
Infrastructure (NestJS / SQLite / Playwright)
       │
       ▼
Application (Use Cases & Ports)
       │
       ▼
Domain (Aggregates, Entities, Value Objects)
```

## Consequences
### Positive
- Framework independence: Domain logic is testable without NestJS bootstrap or mocks.
- Portability: Effortless transition to other platforms (e.g. Spring Boot) if business needs dictate.
- High testability: Domain and application layers can be verified via pure, lightning-fast unit tests.
- Clear team boundaries: Infrastructure updates (e.g. switching DB or browser runner) do not risk domain regressions.

### Negative / Trade-offs
- Requires explicit mapping between Transport DTOs, Application DTOs, and Domain Entities.
- Slightly higher initial boilerplate for dependency wiring in NestJS modules compared to default framework-coupled architectures.
