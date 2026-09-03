import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ElementSelectorHttpDto {
  @ApiProperty({ example: 'button.checkout-btn' })
  public cssSelector!: string;

  @ApiPropertyOptional({ example: 'button' })
  public role?: string;

  @ApiPropertyOptional({ example: 'Pay Now' })
  public accessibleName?: string;

  @ApiPropertyOptional({ example: '/html/body/main/button' })
  public xpath?: string;
}

export class FindingResponseHttpDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  public id!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  public auditId!: string;

  @ApiPropertyOptional({ example: 'DIALOG' })
  public patternType?: string;

  @ApiProperty({ example: 'axe:color-contrast' })
  public ruleId!: string;

  @ApiProperty({ example: 'serious', enum: ['critical', 'serious', 'moderate', 'minor'] })
  public severity!: string;

  @ApiProperty({ example: 'Elements must have sufficient color contrast' })
  public message!: string;

  @ApiPropertyOptional({ example: 'https://dequeuniversity.com/rules/axe/4.4/color-contrast' })
  public helpUrl?: string;

  @ApiProperty({ type: ElementSelectorHttpDto })
  public targetSelector!: ElementSelectorHttpDto;

  @ApiProperty({ example: '<p class="faded">Subtext</p>' })
  public htmlSnippet!: string;

  @ApiProperty({ example: '2026-09-03T01:00:02.000Z' })
  public createdAt!: string;
}
