# Architectural Clarifications & Decision Log

**Specification ID**: `SPEC-001`  
**Document**: Clarification Log  

---

## 1. Cross-Repository Boundary: `a11yfix-api` vs. `a11yfix-web`

### Clarification
- **`a11yfix-web`** is an Angular application residing in a separate repository.
- **WebMCP**: WebMCP tool registration occurs exclusively on the frontend / browser client side.
- **`a11yfix-api`** is a headless backend microservice. It does **not** register or execute WebMCP tools. It exposes standard OpenAPI-documented REST endpoints that the frontend consumes.
- Any contract changes between frontend and backend must be versioned in `spec.md` and published via OpenAPI.

---

## 2. Artificial Intelligence Framework: No Genkit in MVP

### Clarification
- There is no requirement for Genkit or complex agent orchestration within the backend service for the MVP.
- All pattern inspection, detection, remediation generation, and verification logic in this MVP is deterministic and rules-based.
- If generative models are introduced in later milestones (e.g. for enhanced explanation synthesis), they will be hidden behind an `AgentOrchestratorPort` interface without affecting the domain layer.

---

## 3. Spring Boot Portability & Framework Independence

### Clarification
- NestJS is solely a delivery adapter (HTTP controller layer, dependency injection container, and module assembler).
- Domain entities, aggregates, and value objects must not contain any `@Injectable()`, `@Entity()`, or Nest-specific decorators.
- Application use cases must be plain TypeScript classes.
- A future migration to Java / Spring Boot would require re-implementing the infrastructure controllers and repositories in Spring while maintaining identical domain models, ports, and business invariants.

---

## 4. Remediation & Approval Security Invariant

### Clarification
- Remediation is a multi-step guarded process:
  1. `Propose`: Generates a `FixProposal`. Status = `proposed`.
  2. `Approve`: Explicit call to `/remediations/:id/approve`. Status = `approved`.
  3. `Apply`: Executes the fix on the inspected target/DOM. Status = `applied`.
  4. `Verify`: Executes behavioral checks. Status = `verified`.
- At no point may `/apply` be called if status is still `proposed`. Doing so results in `ApprovalRequiredError` (`403 Forbidden` / `400 Bad Request`).

---

## 5. Verification Integrity

### Clarification
- A verification step cannot simply catch exceptions and declare success if no exception was thrown.
- Verification must positively validate expected interaction outcomes:
  - For Dialog: Focus was moved into the dialog, Tab wrapped within the dialog, Escape closed the dialog, focus returned to trigger.
  - For Tabs: Arrow keys updated `aria-selected="true"` and changed the visible `tabpanel`.
  - For Disclosure: Toggle flipped `aria-expanded` and revealed the linked panel.
  - For Combobox: Down arrow expanded listbox, Enter committed selection.
- If positive assertions fail, verification returns status `failed` with granular diagnostic logs.
