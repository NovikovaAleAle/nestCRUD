import { PageOptionsDto } from "./page.options.dto";
import { ApiProperty } from '@nestjs/swagger';

export class PageMetaDto {
  @ApiProperty({ description: 'Total number of records', type: Number })
  readonly totalItemCount: number;

  @ApiProperty({ description: 'Сurrent page', type: Number })
  readonly page: number;

  @ApiProperty({ description: 'The number of records to display on the page', type: Number })
  readonly take: number;

  @ApiProperty({ description: 'Number of pages', type: Number })
  readonly countPage: number;

  constructor(totalItemCount: number, pageOptionsDto: PageOptionsDto,){
    this.totalItemCount = totalItemCount;
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.countPage = Math.ceil(this.totalItemCount/this.take);  
  }
}