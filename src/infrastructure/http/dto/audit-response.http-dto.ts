import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PageHttpDto {
  @ApiProperty({ type: String, example: 'https://example.com/checkout' })
  public url!: string;

  @ApiPropertyOptional({ type: String, example: 'Checkout - Store' })
  public title?: string;

  @ApiPropertyOptional({ type: String, example: '<main>...</main>' })
  public domSnapshotSnippet?: string;

  @ApiProperty({ type: String, example: '2026-09-03T01:00:00.000Z' })
  public inspectedAt!: string;
}

export class AuditResponseHttpDto {
  @ApiProperty({ type: String, example: '123e4567-e89b-12d3-a456-426614174000' })
  public id!: string;

  @ApiProperty({ type: String, example: 'https://example.com/checkout' })
  public url!: string;

  @ApiProperty({ type: String, example: 'completed', enum: ['created', 'running', 'completed', 'failed'] })
  public status!: string;

  @ApiProperty({ type: String, example: '2026-09-03T01:00:00.000Z' })
  public createdAt!: string;

  @ApiPropertyOptional({ type: String, example: '2026-09-03T01:00:01.000Z' })
  public startedAt?: string;

  @ApiPropertyOptional({ type: String, example: '2026-09-03T01:00:05.000Z' })
  public completedAt?: string;

  @ApiPropertyOptional({ type: String, example: 'Failed to connect to host' })
  public errorMessage?: string;

  @ApiProperty({ type: Number, example: 4 })
  public findingsCount!: number;

  @ApiPropertyOptional({ type: () => PageHttpDto })
  public page?: PageHttpDto;
}
