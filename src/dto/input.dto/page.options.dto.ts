import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { IsNumberAndStringMatch } from 'src/decorators/validation.decorators';

export class PageOptionsDto {
  @ApiProperty({ description: 'Number page', minimum:1, default: 1 })
  @IsOptional()
  @IsNumberAndStringMatch(1,{
    message:'page does not match the given pattern',
  })
  readonly page: number = 1;

  @ApiProperty({ description: 'Number of records per page', minimum:3, default: 3 })
  @IsOptional()
  @IsNumberAndStringMatch(3,{
    message:'take does not match the given pattern ',
  },)
  readonly take: number = 3;

  get skip(): number {
    return (this.page - 1) * this.take;
  }
}
