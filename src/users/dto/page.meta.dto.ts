import { PageOptionsDto } from "./page.options.dto";

export class PageMetaDto {
  totalItemCount: number;
  page: number;
  take: number;
  countPage: number;

  constructor(totalItemCount: number, pageOptionsDto: PageOptionsDto,){
    this.totalItemCount = totalItemCount;
    this.page = pageOptionsDto.page;
    this.take = pageOptionsDto.take;
    this.countPage = Math.ceil(this.totalItemCount/this.take);  
  }
}