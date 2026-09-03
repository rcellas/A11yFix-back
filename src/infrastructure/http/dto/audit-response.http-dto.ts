import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageHttpDto {
  @ApiProperty({ example: 'https://example.com/checkout' })
  public url!: string;

  @ApiPropertyOptional({ example: 'Checkout - Store' })
  public title?: string;

  @ApiPropertyOptional({ example: '<main>...</main>' })
  public domSnapshotSnippet?: string;

  @ApiProperty({ example: '2026-09-03T01:00:00.000Z' })
  public inspectedAt!: string;
}

export class AuditResponseHttpDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  public id!: string;

  @ApiProperty({ example: 'https://example.com/checkout' })
  public url!: string;

  @ApiProperty({ example: 'completed', enum: ['created', 'running', 'completed', 'failed'] })
  public status!: string;

  @ApiProperty({ example: '2026-09-03T01:00:00.000Z' })
  public createdAt!: string;

  @ApiPropertyOptional({ example: '2026-09-03T01:00:01.000Z' })
  public startedAt?: string;

  @ApiPropertyOptional({ example: '2026-09-03T01:00:05.000Z' })
  public completedAt?: string;

  @ApiPropertyOptional({ example: 'Failed to connect to host' })
  public errorMessage?: string;

  @ApiProperty({ example: 4 })
  public findingsCount!: number;

  @ApiPropertyOptional({ type: PageHttpDto })
  public page?: PageHttpDto;
}
