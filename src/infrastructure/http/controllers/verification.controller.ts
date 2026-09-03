import { Controller, Post, Param, Body, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { VerifyRemediationUseCase } from '../../../application/use-cases/verify-remediation.use-case';
import { GenerateRegressionTestUseCase } from '../../../application/use-cases/generate-regression-test.use-case';
import {
  VerifyFindingHttpDto,
  VerificationResponseHttpDto,
  RegressionTestResponseHttpDto,
} from '../dto/verification.http-dto';

@ApiTags('Verification & Tests')
@Controller('findings/:id')
export class VerificationController {
  constructor(
    @Inject(VerifyRemediationUseCase)
    private readonly verifyRemediationUseCase: VerifyRemediationUseCase,
    @Inject(GenerateRegressionTestUseCase)
    private readonly generateRegressionTestUseCase: GenerateRegressionTestUseCase,
  ) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Execute behavioral and interactive verification on a finding' })
  @ApiParam({ name: 'id', description: 'Finding UUID' })
  @ApiResponse({
    status: 200,
    description: 'Verification outcome',
    type: VerificationResponseHttpDto,
  })
  public async verify(
    @Param('id') id: string,
    @Body() body?: VerifyFindingHttpDto,
  ): Promise<VerificationResponseHttpDto> {
    return this.verifyRemediationUseCase.execute({
      findingId: id,
      activeElement: body?.activeElement,
      dispatchedKeys: body?.dispatchedKeys,
      focusTrapped: body?.focusTrapped,
    });
  }

  @Post('regression-test')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate standalone Playwright regression test script' })
  @ApiParam({ name: 'id', description: 'Finding UUID' })
  @ApiResponse({
    status: 200,
    description: 'Playwright test code generated',
    type: RegressionTestResponseHttpDto,
  })
  public async generateTest(
    @Param('id') id: string,
  ): Promise<RegressionTestResponseHttpDto> {
    return this.generateRegressionTestUseCase.execute({ findingId: id });
  }
}
