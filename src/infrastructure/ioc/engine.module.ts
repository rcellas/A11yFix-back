import { Module, Global } from '@nestjs/common';
import { PlaywrightBrowserInspector } from '../browser/playwright-browser-inspector';
import { AxeAccessibilityScanner } from '../accessibility/axe-accessibility-scanner';
import { BROWSER_INSPECTOR_PORT } from '../../application/ports/browser-inspector.port';
import { ACCESSIBILITY_SCANNER_PORT } from '../../application/ports/accessibility-scanner.port';
import { PatternRegistry } from '../../domain/pattern/pattern-registry';
import { DialogPattern } from '../../domain/pattern/dialog.pattern';
import { TabsPattern } from '../../domain/pattern/tabs.pattern';
import { DisclosurePattern } from '../../domain/pattern/disclosure.pattern';
import { ComboboxPattern } from '../../domain/pattern/combobox.pattern';
import { MenuButtonPattern } from '../../domain/pattern/menu-button.pattern';
import { BreadcrumbPattern } from '../../domain/pattern/breadcrumb.pattern';
import { TooltipPattern } from '../../domain/pattern/tooltip.pattern';
import { AlertDialogPattern } from '../../domain/pattern/alert-dialog.pattern';
import { AccordionPattern } from '../../domain/pattern/accordion.pattern';

export const PATTERN_REGISTRY_TOKEN = Symbol('PATTERN_REGISTRY_TOKEN');

@Global()
@Module({
  providers: [
    {
      provide: BROWSER_INSPECTOR_PORT,
      useFactory: (): PlaywrightBrowserInspector => {
        return new PlaywrightBrowserInspector();
      },
    },
    {
      provide: ACCESSIBILITY_SCANNER_PORT,
      useFactory: (browserInspector: PlaywrightBrowserInspector): AxeAccessibilityScanner => {
        return new AxeAccessibilityScanner(browserInspector);
      },
      inject: [BROWSER_INSPECTOR_PORT],
    },
    {
      provide: PATTERN_REGISTRY_TOKEN,
      useFactory: (): PatternRegistry => {
        const registry = new PatternRegistry();
        registry.register(new DialogPattern());
        registry.register(new TabsPattern());
        registry.register(new DisclosurePattern());
        registry.register(new ComboboxPattern());
        registry.register(new MenuButtonPattern());
        registry.register(new BreadcrumbPattern());
        registry.register(new TooltipPattern());
        registry.register(new AlertDialogPattern());
        registry.register(new AccordionPattern());
        return registry;
      },
    },
  ],
  exports: [BROWSER_INSPECTOR_PORT, ACCESSIBILITY_SCANNER_PORT, PATTERN_REGISTRY_TOKEN],
})
export class EngineModule {}
