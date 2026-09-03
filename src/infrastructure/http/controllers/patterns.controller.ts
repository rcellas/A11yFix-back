import { Controller, Post, Get, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InspectPatternUseCase } from '../../../application/use-cases/inspect-pattern.use-case';
import {
  InspectPatternHttpDto,
  PatternInspectionResponseHttpDto,
  PatternDescriptorHttpDto,
} from '../dto/inspect-pattern.http-dto';

@ApiTags('Patterns')
@Controller('patterns')
export class PatternsController {
  constructor(
    @Inject(InspectPatternUseCase)
    private readonly inspectPatternUseCase: InspectPatternUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all supported WAI-ARIA accessibility design patterns' })
  @ApiResponse({
    status: 200,
    description: 'List of registered WAI-ARIA patterns',
    type: [PatternDescriptorHttpDto],
  })
  public list(): PatternDescriptorHttpDto[] {
    return [
      {
        type: 'DIALOG',
        name: 'Dialog (Modal focus trap)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
      },
      {
        type: 'TABS',
        name: 'Tabs (WAI-ARIA Tablist)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
      },
      {
        type: 'DISCLOSURE',
        name: 'Disclosure (Expandable section)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
      },
      {
        type: 'COMBOBOX',
        name: 'Combobox (Autocomplete list)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
      },
      {
        type: 'MENU_BUTTON',
        name: 'Menu Button (Popup menu)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
      },
      {
        type: 'BREADCRUMB',
        name: 'Breadcrumb (Navigation trail)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
      },
      {
        type: 'TOOLTIP',
        name: 'Tooltip (Contextual popup)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/',
      },
      {
        type: 'ALERT_DIALOG',
        name: 'Alert Dialog (Urgent confirmation)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/',
      },
      {
        type: 'ACCORDION',
        name: 'Accordion (Multi-section expandable)',
        specUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
      },
    ];
  }

  @Post('inspect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Inspect a DOM element snapshot against WAI-ARIA pattern plugins' })
  @ApiResponse({
    status: 200,
    description: 'Pattern inspection completed',
    type: [PatternInspectionResponseHttpDto],
  })
  public async inspect(
    @Body() body: InspectPatternHttpDto,
  ): Promise<PatternInspectionResponseHttpDto[]> {
    return this.inspectPatternUseCase.execute({
      targetElement: body.targetElement,
      patternType: body.patternType,
    });
  }
}
