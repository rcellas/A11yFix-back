import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ElementSelectorHttpDto {
  @ApiProperty({ type: String, example: 'button.checkout-btn' })
  public cssSelector!: string;

  @ApiPropertyOptional({ type: String, example: 'button' })
  public role?: string;

  @ApiPropertyOptional({ type: String, example: 'Pay Now' })
  public accessibleName?: string;

  @ApiPropertyOptional({ type: String, example: '/html/body/main/button' })
  public xpath?: string;
}

export class FindingResponseHttpDto {
  @ApiProperty({ type: String, example: '123e4567-e89b-12d3-a456-426614174001' })
  public id!: string;

  @ApiProperty({ type: String, example: '123e4567-e89b-12d3-a456-426614174000' })
  public auditId!: string;

  @ApiPropertyOptional({ type: String, example: 'DIALOG' })
  public patternType?: string;

  @ApiProperty({ type: String, example: 'axe:color-contrast' })
  public ruleId!: string;

  @ApiProperty({ type: String, example: 'serious', enum: ['critical', 'serious', 'moderate', 'minor'] })
  public severity!: string;

  @ApiProperty({ type: String, example: 'Elements must have sufficient color contrast' })
  public message!: string;

  @ApiPropertyOptional({ type: String, example: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast' })
  public helpUrl?: string;

  @ApiProperty({ type: () => ElementSelectorHttpDto })
  public targetSelector!: ElementSelectorHttpDto;

  @ApiProperty({ type: String, example: '<p class="faded">Subtext</p>' })
  public htmlSnippet!: string;

  @ApiProperty({ type: String, example: '2026-09-03T01:00:02.000Z' })
  public createdAt!: string;
}
