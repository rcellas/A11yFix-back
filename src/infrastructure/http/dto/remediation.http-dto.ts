import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FixProposalHttpDto {
  @ApiProperty({ example: 'Add aria-modal="true" attribute' })
  public title!: string;

  @ApiProperty({ example: 'Scope screen reader focus inside dialog container' })
  public description!: string;

  @ApiPropertyOptional({ example: '+ aria-modal="true"' })
  public suggestedDiff?: string;

  @ApiPropertyOptional({ example: { 'aria-modal': 'true' } })
  public suggestedAttributes?: Record<string, string>;
}

export class RemediationResponseHttpDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174002' })
  public id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  public findingId!: string;

  @ApiProperty({
    example: 'proposed',
    enum: ['proposed', 'approved', 'applied', 'verified', 'rejected'],
  })
  public status!: string;

  @ApiProperty({ type: FixProposalHttpDto })
  public proposal!: FixProposalHttpDto;

  @ApiProperty({ example: '2026-09-03T01:00:00.000Z' })
  public createdAt!: string;

  @ApiPropertyOptional({ example: '2026-09-03T01:00:01.000Z' })
  public approvedAt?: string;

  @ApiPropertyOptional({ example: '2026-09-03T01:00:02.000Z' })
  public appliedAt?: string;

  @ApiPropertyOptional({ example: '2026-09-03T01:00:03.000Z' })
  public rejectedAt?: string;

  @ApiPropertyOptional({ example: 'Rejected by accessibility engineer' })
  public rejectionReason?: string;
}
