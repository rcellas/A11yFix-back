import { Controller, Get, Param, NotFoundException, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GetFindingUseCase } from '../../../application/use-cases/get-finding.use-case';
import { FindingResponseHttpDto } from '../dto/finding-response.http-dto';

@ApiTags('Findings')
@Controller('findings')
export class FindingsController {
  constructor(
    @Inject(GetFindingUseCase)
    private readonly getFindingUseCase: GetFindingUseCase,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific finding by id' })
  @ApiParam({ name: 'id', description: 'Finding UUID' })
  @ApiResponse({ status: 200, description: 'Finding retrieved', type: FindingResponseHttpDto })
  @ApiResponse({ status: 404, description: 'Finding not found' })
  public async getById(@Param('id') id: string): Promise<FindingResponseHttpDto> {
    const finding = await this.getFindingUseCase.execute({ id });
    if (!finding) {
      throw new NotFoundException(`Finding with id "${id}" not found.`);
    }
    return finding;
  }
}
