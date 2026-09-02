# ADR 0002: SQLite Persistence behind Repository Ports

## Status
Accepted

## Context
The A11yFix project currently operates under a zero infrastructure budget requirement. The initial MVP needs a lightweight, zero-configuration database that can run locally, in lightweight containers, and during development/testing without requiring a dedicated external database service (such as PostgreSQL or MySQL). At the same time, the system must remain portable to PostgreSQL or distributed databases in future production iterations.

## Decision
1. We use **SQLite** (via `better-sqlite3`) as the storage engine for the MVP.
2. All persistence interactions are placed behind clean **Repository Ports** defined in `src/application/ports/`:
   - `AuditRepositoryPort`
   - `FindingRepositoryPort`
   - `RemediationRepositoryPort`
3. Repository adapters implement these ports in `src/infrastructure/persistence/sqlite/`.
4. Domain entities are converted to/from plain database rows strictly within the adapter. No database types, cursors, or SQL fragments ever leak into the application or domain layers.
5. The system assumes storage may be ephemeral in budget preview environments, and provides automatic idempotent schema initialization.

## Consequences
### Positive
- Zero infrastructure overhead, zero hosting fees, zero external database setup needed for developers.
- Blazing-fast unit and integration testing using in-memory SQLite (`:memory:`).
- 100% decoupling from SQL or SQLite dialect: swapping to PostgreSQL in the future merely requires providing a new implementation of the repository ports.

### Negative / Trade-offs
- Concurrency limitations for high-volume concurrent writes (handled via WAL mode and single-process writes).
- File persistence may be ephemeral on serverless or container restarts unless mounted to a persistent volume.
