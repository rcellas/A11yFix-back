import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ElementSelectorHttpDto } from './finding-response.http-dto';

export class DomElementSnapshotHttpDto {
  @ApiProperty({ type: String, example: 'div' })
  public tagName!: string;

  @ApiProperty({ type: Object, example: { role: 'dialog', 'aria-modal': 'true', id: 'my-dialog' } })
  public attributes!: Record<string, string>;

  @ApiPropertyOptional({ type: String, example: 'dialog' })
  public role?: string;

  @ApiPropertyOptional({ type: String, example: 'Confirmation Dialog' })
  public accessibleName?: string;

  @ApiProperty({ type: String, example: '<div role="dialog" id="my-dialog"></div>' })
  public outerHtml!: string;

  @ApiPropertyOptional({ type: String, example: 'Dialog Content' })
  public textContent?: string;

  @ApiPropertyOptional({ type: () => [DomElementSnapshotHttpDto] })
  public children?: DomElementSnapshotHttpDto[];
}

export class InspectPatternHttpDto {
  @ApiProperty({ type: () => DomElementSnapshotHttpDto })
  public targetElement!: DomElementSnapshotHttpDto;

  @ApiPropertyOptional({
    type: String,
    example: 'DIALOG',
    description: 'Optional pattern type to target (DIALOG, TABS, DISCLOSURE, COMBOBOX). If omitted, all matching patterns are evaluated.',
  })
  public patternType?: string;
}

export class PatternViolationHttpDto {
  @ApiProperty({ type: String, example: 'pattern:dialog-accessible-name' })
  public ruleId!: string;

  @ApiProperty({ type: String, example: 'Dialog must have an accessible name via aria-labelledby or aria-label.' })
  public message!: string;

  @ApiProperty({ type: String, example: 'serious' })
  public severity!: string;

  @ApiProperty({ type: () => ElementSelectorHttpDto })
  public targetSelector!: ElementSelectorHttpDto;

  @ApiProperty({ type: String, example: '<div role="dialog"></div>' })
  public htmlSnippet!: string;

  @ApiPropertyOptional({ type: String, example: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' })
  public helpUrl?: string;
}

export class PatternDescriptorHttpDto {
  @ApiProperty({ type: String, example: 'DIALOG' })
  public type!: string;

  @ApiProperty({ type: String, example: 'Dialog (Modal focus trap)' })
  public name!: string;

  @ApiProperty({ type: String, example: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/' })
  public specUrl!: string;
}

export class PatternInspectionResponseHttpDto {
  @ApiProperty({ type: String, example: 'DIALOG' })
  public patternType!: string;

  @ApiProperty({ type: Boolean, example: false })
  public passed!: boolean;

  @ApiProperty({ type: () => [PatternViolationHttpDto] })
  public violations!: PatternViolationHttpDto[];

  @ApiProperty({ type: String, example: '2026-09-03T01:00:00.000Z' })
  public inspectedAt!: string;
}
