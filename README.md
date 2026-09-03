# ♿ A11yFix API — Agent-Native Accessibility QA Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript: 5.x](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Node: >=22](https://img.shields.io/badge/Node.js->=22-green?logo=node.js)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Chromium-red?logo=playwright)](https://playwright.dev/)
[![axe-core](https://img.shields.io/badge/axe--core-4.13-purple)](https://github.com/dequelabs/axe-core)
[![Tests: 162 Passed](https://img.shields.io/badge/Tests-162%20Passed-brightgreen)](https://vitest.dev/)

**A11yFix API** is an agent-native, autonomous accessibility (a11y) QA platform backend. It orchestrates live browser automation, standard WCAG 2.2 rule evaluations, advanced **WAI-ARIA Authoring Practices Guide (APG)** behavioral pattern detection, interactive verification, and automated Playwright regression test generation.

---

## 🌟 Key Features

- 🌐 **Live Browser Inspection**: Headless Chromium orchestration with [Playwright](https://playwright.dev/) for real target URL rendering.
- 🔍 **Hybrid Analysis Engine**: Dual inspection combining static `axe-core` rule scanning with 9 custom heuristic WAI-ARIA APG pattern analyzers.
- 🧠 **Agent-Native Remediation**: Generates actionable, non-destructive HTML/ARIA fix proposals with strict approval invariants.
- 🧪 **Interactive Behavioral Verification**: Validates keyboard navigation flows (`Tab`, `Escape`, `Arrow` keys), focus traps, and live ARIA states.
- 🤖 **Playwright Regression Test Generator**: Automatically outputs standalone TypeScript test scripts using semantic locators (`page.getByRole`, `page.getByLabel`).
- 🛡️ **SSRF Defense-in-Depth**: Strict URL & DNS boundary filtering blocking internal networks, loopback addresses (`127.0.0.1`, `localhost`), RFC 1918 private subnets, and Cloud instance metadata (`169.254.169.254`).
- 🏛️ **Hexagonal Architecture**: 100% pure TypeScript Domain and Application core, completely decoupled from delivery frameworks and databases.

---

## 🤖 WebMCP Integration Architecture

A11yFix is designed from the ground up for agentic interaction. The frontend workspace exposes client tools directly to autonomous agents using the **WebMCP (Model Context Protocol)** browser standard:

```typescript
// WebMCP tool registration on document.modelContext
document.modelContext.registerTool({
  name: "inspect_pattern",
  description: "Inspect a DOM element snapshot against WAI-ARIA pattern plugins",
  inputSchema: {
    type: "object",
    properties: {
      targetElement: {
        type: "object",
        properties: {
          tagName: { type: "string" },
          attributes: { type: "object" },
          outerHtml: { type: "string" },
        },
        required: ["tagName", "outerHtml"],
      },
      patternType: {
        type: "string",
        enum: ["DIALOG", "TABS", "DISCLOSURE", "COMBOBOX", "MENU_BUTTON", "BREADCRUMB", "TOOLTIP", "ALERT_DIALOG", "ACCORDION"],
      },
    },
    required: ["targetElement"],
  },
  execute: async (input) => {
    const response = await fetch("http://localhost:3000/patterns/inspect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return await response.json();
  },
});
```

Autonomous agents can seamlessly discover tools, audit live URLs, analyze complex interactive patterns, review diffs, approve remediations, and export Playwright test scripts.

---

## 🏛️ Hexagonal Architecture (Ports & Adapters)

The repository strictly enforces the dependency rule: `Infrastructure` $\rightarrow$ `Application` $\rightarrow$ `Domain`.

```text
src/
├── domain/                  # 100% Pure TypeScript business models & rules
│   ├── audit/               # Audit aggregate, AuditId, TargetUrl, AuditStatus
│   ├── finding/             # Finding aggregate, FindingId, Severity, ElementSelector
│   ├── pattern/             # AccessibilityPattern interface, Registry, Plugins (P-01 to P-09)
│   ├── remediation/         # Remediation aggregate, FixProposal, Approval invariants
│   └── verification/        # VerificationResult, VerificationStatus
│
├── application/             # Use cases & port interfaces
│   ├── ports/               # Driven ports (Repositories, BrowserInspector, Scanner, etc.)
│   ├── dto/                 # Input / Output DTO contracts
│   └── use-cases/           # CreateAudit, InspectPattern, ProposeRemediation, Verify, etc.
│
├── infrastructure/          # Adapters & Framework delivery
│   ├── http/                # NestJS controllers, OpenAPI Swagger decorators, filters
│   ├── browser/             # Playwright adapter implementing BrowserInspectorPort
│   ├── accessibility/       # axe-core scanner adapter implementing AccessibilityScannerPort
│   ├── persistence/         # SQLite repositories with WAL mode
│   └── ioc/                 # Dependency injection wiring modules
│
└── config/                  # Environment configuration validated with Zod
```

---

## 🧩 WAI-ARIA APG Pattern Catalog (P-01 to P-09)

| ID | Pattern | Heuristic Detection Trigger | Key Behavioral Rules & Remediations |
| :--- | :--- | :--- | :--- |
| **P-01** | **`DIALOG`** | `role="dialog"`, modal classes | Focus trapping, `Escape` key close, `aria-modal="true"`, focus restoration. |
| **P-02** | **`TABS`** | `tablist`, `tab`, `tabpanel` | `ArrowLeft`/`ArrowRight` navigation, `aria-selected`, tabpanel associations. |
| **P-03** | **`DISCLOSURE`** | `<details>`, `aria-expanded` buttons | `Enter`/`Space` toggle, `aria-expanded` state tracking, `aria-controls`. |
| **P-04** | **`COMBOBOX`** | `role="combobox"`, input lists | `ArrowDown` activation, `aria-expanded`, `aria-autocomplete`, listbox link. |
| **P-05** | **`MENU_BUTTON`** | `aria-haspopup="menu"`, menubars | `aria-haspopup="menu"`, `aria-expanded`, `Escape` dismissal, item navigation. |
| **P-06** | **`BREADCRUMB`** | `<nav>`, breadcrumb classes | `<nav aria-label="Breadcrumb">` landmark, `aria-current="page"` active link. |
| **P-07** | **`TOOLTIP`** | `role="tooltip"`, popovers | `role="tooltip"`, `aria-describedby` linkage to interactive trigger. |
| **P-08** | **`ALERT_DIALOG`** | `role="alertdialog"`, confirm modals | `role="alertdialog"`, `aria-modal="true"`, `aria-describedby` alert message. |
| **P-09** | **`ACCORDION`** | Accordion headers & panels | Native `<button>` headers, `aria-expanded`, `aria-controls` panel linkage. |

---

## 📡 REST API Reference

Interactive OpenAPI / Swagger documentation is available at **`/api/docs`**.

### Audits
- `POST /audits`: Launch live headless browser scan (`{ "url": "https://example.com" }`).
- `GET /audits`: List recent audit history.
- `GET /audits/:id`: Retrieve audit summary and completion status.
- `GET /audits/:id/findings`: List all WCAG and WAI-ARIA findings for an audit.

### Findings & Patterns
- `GET /findings/:id`: Retrieve single finding details.
- `GET /patterns`: List all 9 supported WAI-ARIA APG pattern descriptors.
- `POST /patterns/inspect`: Inspect raw DOM element snapshots against pattern plugins.

### Remediation & Verification
- `POST /findings/:id/remediation`: Generate non-destructive fix proposal.
- `GET /findings/:id/remediations`: List remediation history for a finding.
- `POST /remediations/:id/approve`: Approve a remediation proposal.
- `POST /remediations/:id/apply`: Apply approved remediation.
- `POST /findings/:id/verify`: Execute behavioral focus/keyboard verification.
- `POST /findings/:id/regression-test`: Generate standalone Playwright TypeScript regression test.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `>= 22.0.0`
- **pnpm**: `>= 9.0.0`

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/rcellas/A11yFix-back.git
   cd A11yFix-back
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Install Playwright Chromium browser**:
   ```bash
   pnpm playwright install chromium
   ```

4. **Start development server with live reload**:
   ```bash
   pnpm start:dev
   ```
   Server runs at `http://localhost:3000`. Swagger docs at `http://localhost:3000/api/docs`.

---

## 🐳 Docker & Cloud Deployment (Render)

### Running with Docker locally
```bash
docker build -t a11yfix-api .
docker run -p 3000:3000 a11yfix-api
```

---

## 🧪 Testing & Quality Gates

A11yFix follows strict Test-Driven Development (TDD) quality gates:

```bash
# Type-check with strict mode
pnpm typecheck

# Code quality and architecture boundary linting
pnpm lint

# Run all 162 unit and E2E integration tests
pnpm test

# Production build
pnpm build
```

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
