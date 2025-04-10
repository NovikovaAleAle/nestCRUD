import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class PageOptionsDto {
  @ApiPropertyOptional({ description: 'Number page', minimum: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Expose()
  readonly page: number = 1;

  @ApiPropertyOptional({
    description: 'Number of records per page',
    minimum: 3,
    default: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  @Expose()
  readonly take: number = 3;

  @Expose()
  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
