import { IsNotEmpty,IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InputUuidDto {
  @ApiProperty({ description: 'UUID' })
  @IsNotEmpty()
  @IsUUID()
  readonly uuid: string;
}
