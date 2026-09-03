import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ElementSelectorHttpDto } from './finding-response.http-dto';

export class DomElementSnapshotHttpDto {
  @ApiProperty({ example: 'div' })
  public tagName!: string;

  @ApiProperty({ example: { role: 'dialog', 'aria-modal': 'true', id: 'my-dialog' } })
  public attributes!: Record<string, string>;

  @ApiPropertyOptional({ example: 'dialog' })
  public role?: string;

  @ApiPropertyOptional({ example: 'Confirmation Dialog' })
  public accessibleName?: string;

  @ApiProperty({ example: '<div role="dialog" id="my-dialog"></div>' })
  public outerHtml!: string;

  @ApiPropertyOptional({ example: 'Dialog Content' })
  public textContent?: string;

  @ApiPropertyOptional({ type: [DomElementSnapshotHttpDto] })
  public children?: DomElementSnapshotHttpDto[];
}

export class InspectPatternHttpDto {
  @ApiProperty({ type: DomElementSnapshotHttpDto })
  public targetElement!: DomElementSnapshotHttpDto;

  @ApiPropertyOptional({
    example: 'DIALOG',
    description: 'Optional pattern type to target (DIALOG, TABS, DISCLOSURE, COMBOBOX). If omitted, all matching patterns are evaluated.',
  })
  public patternType?: string;
}

export class PatternViolationHttpDto {
  @ApiProperty({ example: 'pattern:dialog-accessible-name' })
  public ruleId!: string;

  @ApiProperty({ example: 'Dialog must have an accessible name via aria-labelledby or aria-label.' })
  public message!: string;

  @ApiProperty({ example: 'serious' })
  public severity!: string;

  @ApiProperty({ type: ElementSelectorHttpDto })
  public targetSelector!: ElementSelectorHttpDto;

  @ApiProperty({ example: '<div role="dialog"></div>' })
  public htmlSnippet!: string;

  @ApiPropertyOptional({ example: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' })
  public helpUrl?: string;
}

export class PatternInspectionResponseHttpDto {
  @ApiProperty({ example: 'DIALOG' })
  public patternType!: string;

  @ApiProperty({ example: false })
  public passed!: boolean;

  @ApiProperty({ type: [PatternViolationHttpDto] })
  public violations!: PatternViolationHttpDto[];

  @ApiProperty({ example: '2026-09-03T01:00:00.000Z' })
  public inspectedAt!: string;
}
