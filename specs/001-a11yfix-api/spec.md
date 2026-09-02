# Functional & Technical Specification: A11yFix API

**Specification ID**: `SPEC-001`  
**Title**: A11yFix Backend Core API & Engine  
**Version**: 1.0.0  
**Status**: Approved  

---

## 1. Executive Summary

A11yFix is an agent-native accessibility QA platform. This specification defines the architecture, domain model, application use cases, ports, adapters, HTTP contracts, and security boundaries of the **A11yFix API** (`a11yfix-api`).

The system orchestrates automated accessibility audits of public web URLs, analyzes WAI-ARIA design patterns, discovers actionable findings, generates non-destructive remediation proposals, manages explicit human/agent approvals, applies fixes, verifies behavior interactively in headless browsers, and produces semantic Playwright regression tests.

---

## 2. Core Workflow & State Machines

### 2.1 The 7-Stage Core Pipeline
```text
Detect ──► Understand ──► Propose ──► Approve ──► Fix ──► Verify ──► Prevent Regression
```

### 2.2 Audit Lifecycle
```text
               ┌──────────┐
               │ created  │
               └────┬─────┘
                    │ (start execution)
                    ▼
               ┌──────────┐
               │ running  │
               └────┬─────┘
         ┌──────────┴──────────┐
         │ (success)           │ (unhandled failure / timeout)
         ▼                     ▼
   ┌───────────┐         ┌──────────┐
   │ completed │         │  failed  │
   └───────────┘         └──────────┘
```
**Invariants**:
- An `Audit` is created in state `created`.
- Transition to `running` happens when the browser worker begins navigation.
- Terminal states are `completed` or `failed`.
- Status is never represented by disassociated boolean flags.

### 2.3 Remediation Lifecycle
```text
     ┌──────────┐
     │ proposed │
     └────┬─────┘
          │
     ┌────┴────────────┐
     │ (approve)       │ (reject)
     ▼                 ▼
┌──────────┐     ┌──────────┐
│ approved │     │ rejected │
└────┬─────┘     └──────────┘
     │ (apply)
     ▼
┌──────────┐
│ applied  │
└────┬─────┘
     │ (verify)
     ▼
┌──────────┐
│ verified │ (VerificationStatus: passed | failed)
└──────────┘
```
**Invariants**:
- A remediation proposal MUST be explicitly approved before application.
- Applying an unapproved proposal immediately throws `ApprovalRequiredError`.
- Verification outcome is explicitly recorded as `passed` or `failed`.

---

## 3. Domain Model Specification

### 3.1 Value Objects & Identifiers
- **`AuditId`**: UUID v4 strongly-typed identifier.
- **`FindingId`**: UUID v4 strongly-typed identifier.
- **`RemediationId`**: UUID v4 strongly-typed identifier.
- **`TargetUrl`**: Validated public URL (HTTP/HTTPS only, non-private, non-loopback).
- **`Severity`**: `critical` | `serious` | `moderate` | `minor`.
- **`PatternType`**: `DIALOG` | `TABS` | `DISCLOSURE` | `COMBOBOX`.
- **`AuditStatus`**: `created` | `running` | `completed` | `failed`.
- **`RemediationStatus`**: `proposed` | `approved` | `applied` | `verified` | `rejected`.
- **`VerificationStatus`**: `passed` | `failed`.
- **`ElementSelector`**: Semantic target representation (role, accessible name, CSS selector fallback).

### 3.2 Aggregates & Entities

#### 3.2.1 `Audit` (Aggregate Root)
- `id: AuditId`
- `url: TargetUrl`
- `status: AuditStatus`
- `createdAt: Date`
- `startedAt?: Date`
- `completedAt?: Date`
- `errorMessage?: string`
- `findingsCount: number`

#### 3.2.2 `Finding` (Aggregate Root)
- `id: FindingId`
- `auditId: AuditId`
- `patternType?: PatternType`
- `ruleId: string` (e.g. `axe:color-contrast`, `pattern:dialog-focus-trap`)
- `severity: Severity`
- `message: string`
- `helpUrl?: string`
- `targetSelector: ElementSelector`
- `htmlSnippet: string`
- `createdAt: Date`

#### 3.2.3 `Remediation` (Aggregate Root)
- `id: RemediationId`
- `findingId: FindingId`
- `proposal: FixProposal`
- `status: RemediationStatus`
- `approvedAt?: Date`
- `appliedAt?: Date`
- `verificationResult?: VerificationResult`
- `createdAt: Date`

#### 3.2.4 `FixProposal`
- `title: string`
- `description: string`
- `suggestedDiff: string`
- `suggestedAttributes: Record<string, string>`

#### 3.2.5 `VerificationResult`
- `status: VerificationStatus`
- `testedAt: Date`
- `checkResults: VerificationCheck[]`
- `summary: string`

#### 3.2.6 `RegressionTest`
- `findingId: FindingId`
- `testCode: string`
- `framework: "playwright"`
- `selectorsUsed: string[]`
- `generatedAt: Date`

---

## 4. Accessibility Patterns Specification

Patterns are autonomous domain plugins registered in `PatternRegistry`:

### 4.1 P-01 Dialog (Modal / Non-Modal)
- **Semantic Structure**: `role="dialog"` or `role="alertdialog"`, `aria-modal="true"` (if modal).
- **Accessible Name**: `aria-labelledby` or `aria-label`.
- **Focus Management**:
  - Focus moves into dialog upon opening (first focusable child or dialog container).
  - Tab and Shift+Tab wrap within dialog (Focus Trap).
  - Closing restores focus to the invoking trigger button.
- **Keyboard Interaction**: `Escape` key closes dialog.

### 4.2 P-02 Tabs
- **Semantic Structure**: Container `role="tablist"`, items `role="tab"`, panels `role="tabpanel"`.
- **Relationships**: `aria-controls` links tab to tabpanel; `aria-labelledby` links tabpanel to tab.
- **Selection State**: Active tab has `aria-selected="true"`, inactive `aria-selected="false"`.
- **Keyboard Interaction**:
  - `Left` / `Right` Arrow keys navigate between horizontal tabs.
  - `Home` / `End` move to first / last tab.
  - `Tab` navigates from active tab directly into the active tabpanel.

### 4.3 P-03 Disclosure / Accordion
- **Semantic Structure**: Trigger button controls visibility of collapsible content panel.
- **State**: `aria-expanded="true|false"` on trigger.
- **Relationship**: `aria-controls` on trigger references collapsible panel `id`.
- **Keyboard Interaction**: `Enter` and `Space` toggle disclosure state.

### 4.4 P-04 Combobox
- **Semantic Structure**: Input `role="combobox"`, popup `role="listbox"`, items `role="option"`.
- **State**: `aria-expanded="true|false"`, `aria-autocomplete="list|both|none"`.
- **Active Descendant**: `aria-activedescendant` tracks focused option during navigation.
- **Keyboard Interaction**: `DownArrow` opens popup and navigates options, `Enter` selects, `Escape` closes popup.

---

## 5. Application Ports

### 5.1 Driven Ports (Infrastructure SPI)
```typescript
export interface AuditRepositoryPort {
  save(audit: Audit): Promise<void>;
  findById(id: AuditId): Promise<Audit | null>;
}

export interface FindingRepositoryPort {
  saveMany(findings: Finding[]): Promise<void>;
  findById(id: FindingId): Promise<Finding | null>;
  findByAuditId(auditId: AuditId): Promise<Finding[]>;
}

export interface RemediationRepositoryPort {
  save(remediation: Remediation): Promise<void>;
  findById(id: RemediationId): Promise<Remediation | null>;
  findByFindingId(findingId: FindingId): Promise<Remediation | null>;
}

export interface BrowserInspectorPort {
  open(url: TargetUrl): Promise<BrowserSession>;
  close(session: BrowserSession): Promise<void>;
  inspectDom(session: BrowserSession, selector: string): Promise<DomElementSnapshot>;
  runKeyboardFlow(session: BrowserSession, flow: KeyboardSequence): Promise<KeyboardResult>;
  inspectFocus(session: BrowserSession): Promise<FocusSnapshot>;
}

export interface AccessibilityScannerPort {
  scan(session: BrowserSession): Promise<RawScanViolation[]>;
}

export interface RegressionTestGeneratorPort {
  generatePlaywrightTest(finding: Finding, verification: VerificationResult): Promise<RegressionTest>;
}
```

---

## 6. HTTP REST API Contracts

### 6.1 Endpoints
| Method | Path | Description | Success Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/audits` | Start a new accessibility audit | `201 Created` |
| `GET` | `/audits/:id` | Get audit status and metadata | `200 OK` |
| `GET` | `/audits/:id/findings` | Get all findings discovered in an audit | `200 OK` |
| `GET` | `/findings/:id` | Get single finding details | `200 OK` |
| `POST` | `/findings/:id/remediation` | Propose remediation for a finding | `201 Created` |
| `POST` | `/remediations/:id/approve` | Approve a remediation proposal | `200 OK` |
| `POST` | `/remediations/:id/apply` | Apply an approved remediation | `200 OK` |
| `POST` | `/findings/:id/verify` | Verify remediated behavior | `200 OK` |
| `POST` | `/findings/:id/regression-test` | Generate Playwright regression test | `201 Created` |
| `GET` | `/health` | Liveness & Readiness probe | `200 OK` |

### 6.2 Error Schema
All error responses adhere to RFC 7807 (Problem Details):
```json
{
  "type": "https://api.a11yfix.dev/errors/forbidden-target",
  "title": "Forbidden Target URL",
  "status": 400,
  "detail": "Target IP resolves to a private RFC 1918 range which is prohibited.",
  "instance": "/audits",
  "code": "FORBIDDEN_TARGET",
  "timestamp": "2026-09-02T22:00:00.000Z"
}
```
