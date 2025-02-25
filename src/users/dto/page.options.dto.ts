import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class PageOptionsDto {
  @ApiProperty({ description: 'Number page', default: 1 })
  @IsOptional()
  readonly page: number = 1;

  @ApiProperty({ description: 'Number of records per page', default: 3 })
  @IsOptional()
  readonly take: number = 3;

  get getSkip(): number {
    return (this.page - 1) * this.take;
  }
}
