import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { InspectPatternUseCase } from '../../../application/use-cases/inspect-pattern.use-case';
import {
  InspectPatternHttpDto,
  PatternInspectionResponseHttpDto,
} from '../dto/inspect-pattern.http-dto';

@ApiTags('Patterns')
@Controller('patterns')
export class PatternsController {
  constructor(private readonly inspectPatternUseCase: InspectPatternUseCase) {}

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
