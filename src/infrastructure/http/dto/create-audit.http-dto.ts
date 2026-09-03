import { ApiProperty } from '@nestjs/swagger';

export class CreateAuditHttpDto {
  @ApiProperty({
    type: String,
    description: 'Target public URL to audit for accessibility compliance',
    example: 'https://example.com/checkout',
  })
  public url!: string;
}
