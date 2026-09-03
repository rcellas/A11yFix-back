import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DomElementSnapshotHttpDto } from './inspect-pattern.http-dto';

export class VerifyFindingHttpDto {
  @ApiPropertyOptional({ type: () => DomElementSnapshotHttpDto })
  public activeElement?: DomElementSnapshotHttpDto;

  @ApiPropertyOptional({ type: [String], example: ['Tab', 'Escape'] })
  public dispatchedKeys?: string[];

  @ApiPropertyOptional({ type: Boolean, example: true })
  public focusTrapped?: boolean;
}

export class VerificationCheckHttpDto {
  @ApiProperty({ type: String, example: 'Focus Trap Verification' })
  public name!: string;

  @ApiProperty({ type: Boolean, example: true })
  public passed!: boolean;

  @ApiPropertyOptional({ type: String, example: 'Focus was properly contained.' })
  public details?: string;
}

export class VerificationResponseHttpDto {
  @ApiProperty({ type: String, example: 'passed', enum: ['passed', 'failed', 'unverified'] })
  public status!: string;

  @ApiProperty({ type: String, example: '2026-09-03T01:00:00.000Z' })
  public testedAt!: string;

  @ApiProperty({ type: () => [VerificationCheckHttpDto] })
  public checks!: VerificationCheckHttpDto[];

  @ApiProperty({ type: String, example: 'All behavioral checks passed successfully.' })
  public summary!: string;
}

export class RegressionTestResponseHttpDto {
  @ApiProperty({ type: String, example: '123e4567-e89b-12d3-a456-426614174001' })
  public findingId!: string;

  @ApiProperty({ type: String, example: 'playwright' })
  public framework!: string;

  @ApiProperty({ type: String, example: 'Accessibility Regression: dialog-modal-attribute on #dialog' })
  public testName!: string;

  @ApiProperty({
    type: String,
    example: "import { test, expect } from '@playwright/test'; ...",
  })
  public code!: string;
}
