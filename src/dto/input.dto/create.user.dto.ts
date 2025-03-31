import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InputUserDto } from './input.user.dto';
import { InputCredentialDto } from './input.credential.dto';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User data', type: () => InputUserDto })
  @ValidateNested()
  @Type(() => InputUserDto)
  readonly user: InputUserDto;

  @ApiProperty({
    description: 'Credential data',
    type: () => InputCredentialDto,
  })
  @ValidateNested()
  @Type(() => InputCredentialDto)
  readonly credential: InputCredentialDto;
}
