import { PageMetaDto } from '../page.meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import { OutputPostDto } from './output.post.dto';

export class PagePostsDto<OutputPostDto> {
  @ApiProperty({
    description: 'List of records with the pagination option',
    type: () => [OutputPostDto],
  })
  readonly data: OutputPostDto[];

  @ApiProperty({ description: 'Pagination metadata', type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: OutputPostDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
