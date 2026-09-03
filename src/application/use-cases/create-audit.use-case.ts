import { AuditRepositoryPort } from '../ports/audit-repository.port';
import { FindingRepositoryPort } from '../ports/finding-repository.port';
import { BrowserInspectorPort } from '../ports/browser-inspector.port';
import { AccessibilityScannerPort } from '../ports/accessibility-scanner.port';
import { PatternRegistry } from '../../domain/pattern/pattern-registry';
import { CreateAuditInput, AuditOutput } from '../dto/audit.dto';
import { TargetUrl } from '../../domain/audit/target-url';
import { Audit } from '../../domain/audit/audit';
import { Page } from '../../domain/audit/page';
import { Finding } from '../../domain/finding/finding';

/**
 * Use case: Initiates and executes an accessibility audit for a public target URL.
 * Orchestrates browser inspection (Playwright), axe-core scanning, and WAI-ARIA pattern analysis.
 * 100% pure TypeScript, zero framework dependencies.
 */
export class CreateAuditUseCase {
  constructor(
    private readonly auditRepository: AuditRepositoryPort,
    private readonly findingRepository?: FindingRepositoryPort,
    private readonly browserInspector?: BrowserInspectorPort,
    private readonly accessibilityScanner?: AccessibilityScannerPort,
    private readonly patternRegistry?: PatternRegistry,
  ) {}

  public async execute(input: CreateAuditInput): Promise<AuditOutput> {
    const targetUrl = TargetUrl.create(input.url);
    const audit = Audit.create(targetUrl);

    await this.auditRepository.save(audit);

    // If live engine ports are injected, execute scan pipeline
    if (
      this.findingRepository &&
      this.browserInspector &&
      this.accessibilityScanner
    ) {
      audit.start();
      await this.auditRepository.save(audit);

      let session;
      try {
        session = await this.browserInspector.open(targetUrl);
        const domSnapshot = await this.browserInspector.inspectDom(session);

        const pageSnapshot = Page.create({
          url: targetUrl,
          title: session.url,
          domSnapshotSnippet: domSnapshot.outerHtml.slice(0, 1000),
          inspectedAt: new Date(),
        });

        // 1. Broad-spectrum axe-core static scan
        const rawAxeViolations = await this.accessibilityScanner.scan(session);
        const findings: Finding[] = [];

        for (const v of rawAxeViolations) {
          findings.push(
            Finding.create({
              auditId: audit.id,
              ruleId: v.ruleId,
              severity: v.severity,
              message: v.message,
              helpUrl: v.helpUrl,
              targetSelector: v.targetSelector,
              htmlSnippet: v.htmlSnippet,
            }),
          );
        }

        // 2. WAI-ARIA Pattern Plugin Analysis
        if (this.patternRegistry) {
          const patternDetections = this.patternRegistry.detectAll({
            targetElement: domSnapshot,
            url: targetUrl.value,
          });

          for (const detection of patternDetections) {
            const auditResult = detection.pattern.audit({
              targetElement: detection.matchedElement,
              url: targetUrl.value,
            });

            for (const violation of auditResult.violations) {
              findings.push(
                Finding.create({
                  auditId: audit.id,
                  patternType: detection.pattern.type,
                  ruleId: violation.ruleId,
                  severity: violation.severity,
                  message: violation.message,
                  helpUrl: violation.helpUrl,
                  targetSelector: violation.targetSelector,
                  htmlSnippet: violation.htmlSnippet,
                }),
              );
            }
          }
        }

        // 3. Persist findings
        if (findings.length > 0) {
          await this.findingRepository.saveMany(findings);
        }

        audit.complete(findings.length, pageSnapshot);
        await this.auditRepository.save(audit);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        audit.fail(errorMsg);
        await this.auditRepository.save(audit);
      } finally {
        if (session) {
          await this.browserInspector.close(session).catch(() => undefined);
        }
      }
    }

    return audit.toJSON();
  }
}
