import { OutputUserDto } from './output.user.dto';
import { PageMetaDto } from '../page.meta.dto';
import { ApiProperty } from '@nestjs/swagger';

export class PageDto<OutputUserDto> {
  @ApiProperty({
    description: 'List of records with the pagination option',
    type: () => [OutputUserDto],
  })
  readonly data: OutputUserDto[];

  @ApiProperty({ description: 'Pagination metadata', type: () => PageMetaDto })
  readonly meta: PageMetaDto;

  constructor(data: OutputUserDto[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
