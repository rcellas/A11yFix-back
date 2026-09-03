import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  NotFoundException,
  HttpCode,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateAuditUseCase } from '../../../application/use-cases/create-audit.use-case';
import { GetAuditUseCase } from '../../../application/use-cases/get-audit.use-case';
import { ListAuditsUseCase } from '../../../application/use-cases/list-audits.use-case';
import { GetFindingsUseCase } from '../../../application/use-cases/get-findings.use-case';
import { CreateAuditHttpDto } from '../dto/create-audit.http-dto';
import { AuditResponseHttpDto } from '../dto/audit-response.http-dto';
import { FindingResponseHttpDto } from '../dto/finding-response.http-dto';

@ApiTags('Audits')
@Controller('audits')
export class AuditsController {
  constructor(
    @Inject(CreateAuditUseCase)
    private readonly createAuditUseCase: CreateAuditUseCase,
    @Inject(GetAuditUseCase)
    private readonly getAuditUseCase: GetAuditUseCase,
    @Inject(ListAuditsUseCase)
    private readonly listAuditsUseCase: ListAuditsUseCase,
    @Inject(GetFindingsUseCase)
    private readonly getFindingsUseCase: GetFindingsUseCase,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List recent accessibility audits' })
  @ApiResponse({ status: 200, description: 'Audits list', type: [AuditResponseHttpDto] })
  public async list(): Promise<AuditResponseHttpDto[]> {
    return this.listAuditsUseCase.execute();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new accessibility audit' })
  @ApiResponse({ status: 201, description: 'Audit initiated successfully', type: AuditResponseHttpDto })
  @ApiResponse({ status: 400, description: 'Invalid target URL format' })
  public async create(@Body() body: CreateAuditHttpDto): Promise<AuditResponseHttpDto> {
    const rawUrl = body?.url ?? (body as unknown as { targetUrl?: string })?.targetUrl;
    return this.createAuditUseCase.execute({ url: rawUrl });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit status and details by id' })
  @ApiParam({ name: 'id', description: 'Audit UUID' })
  @ApiResponse({ status: 200, description: 'Audit retrieved', type: AuditResponseHttpDto })
  @ApiResponse({ status: 404, description: 'Audit not found' })
  public async getById(@Param('id') id: string): Promise<AuditResponseHttpDto> {
    const audit = await this.getAuditUseCase.execute({ id });
    if (!audit) {
      throw new NotFoundException(`Audit with id "${id}" not found.`);
    }
    return audit;
  }

  @Get(':id/findings')
  @ApiOperation({ summary: 'Get all accessibility findings for an audit' })
  @ApiParam({ name: 'id', description: 'Audit UUID' })
  @ApiResponse({ status: 200, description: 'Findings list', type: [FindingResponseHttpDto] })
  public async getFindings(@Param('id') id: string): Promise<FindingResponseHttpDto[]> {
    return this.getFindingsUseCase.execute({ auditId: id });
  }
}
