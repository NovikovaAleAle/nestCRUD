import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PageOptionsDto {
  @ApiProperty({ description: 'Number page', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;

  @ApiProperty({
    description: 'Number of records per page',
    minimum: 3,
    default: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  readonly take: number = 3;
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
