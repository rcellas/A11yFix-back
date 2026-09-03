import {
  Controller,
  Post,
  Get,
  Param,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ProposeRemediationUseCase } from '../../../application/use-cases/propose-remediation.use-case';
import { ApproveRemediationUseCase } from '../../../application/use-cases/approve-remediation.use-case';
import { ApplyRemediationUseCase } from '../../../application/use-cases/apply-remediation.use-case';
import { GetRemediationsUseCase } from '../../../application/use-cases/get-remediations.use-case';
import { RemediationResponseHttpDto } from '../dto/remediation.http-dto';

@ApiTags('Remediations')
@Controller()
export class RemediationsController {
  constructor(
    @Inject(ProposeRemediationUseCase)
    private readonly proposeRemediationUseCase: ProposeRemediationUseCase,
    @Inject(ApproveRemediationUseCase)
    private readonly approveRemediationUseCase: ApproveRemediationUseCase,
    @Inject(ApplyRemediationUseCase)
    private readonly applyRemediationUseCase: ApplyRemediationUseCase,
    @Inject(GetRemediationsUseCase)
    private readonly getRemediationsUseCase: GetRemediationsUseCase,
  ) {}

  @Post('findings/:findingId/remediation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate fix proposals for a specific finding' })
  @ApiParam({ name: 'findingId', description: 'Finding UUID' })
  @ApiResponse({
    status: 200,
    description: 'Fix proposals generated',
    type: [RemediationResponseHttpDto],
  })
  public async propose(
    @Param('findingId') findingId: string,
  ): Promise<RemediationResponseHttpDto[]> {
    return this.proposeRemediationUseCase.execute({ findingId });
  }

  @Get('findings/:findingId/remediations')
  @ApiOperation({ summary: 'Get all remediation proposals for a finding' })
  @ApiParam({ name: 'findingId', description: 'Finding UUID' })
  @ApiResponse({
    status: 200,
    description: 'Remediations list',
    type: [RemediationResponseHttpDto],
  })
  public async getByFinding(
    @Param('findingId') findingId: string,
  ): Promise<RemediationResponseHttpDto[]> {
    return this.getRemediationsUseCase.execute({ findingId });
  }

  @Post('remediations/:id/approve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Approve a proposed remediation' })
  @ApiParam({ name: 'id', description: 'Remediation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Remediation approved',
    type: RemediationResponseHttpDto,
  })
  public async approve(@Param('id') id: string): Promise<RemediationResponseHttpDto> {
    return this.approveRemediationUseCase.execute({ remediationId: id });
  }

  @Post('remediations/:id/apply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply an approved remediation' })
  @ApiParam({ name: 'id', description: 'Remediation UUID' })
  @ApiResponse({
    status: 200,
    description: 'Remediation applied',
    type: RemediationResponseHttpDto,
  })
  public async apply(@Param('id') id: string): Promise<RemediationResponseHttpDto> {
    return this.applyRemediationUseCase.execute({ remediationId: id });
  }
}
