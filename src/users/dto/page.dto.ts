import { PageMetaDto } from './page.meta.dto';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user.entity';

export class PageDto<T> {
  @ApiProperty({description: 'list of records with the pagination option'})
  readonly data: T[];

  @ApiProperty({description: 'pagination metadata', type: () => PageMetaDto})
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
