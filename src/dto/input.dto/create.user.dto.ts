import { ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { InputUserDto } from './input.user.dto';
import { InputCredentialDto } from './input.credential.dto';

export class CreateUserDto {
  @ValidateNested()
  @Type(() => InputUserDto)
  user: InputUserDto;

  @ValidateNested()
  @Type(() => InputCredentialDto)
  credential: InputCredentialDto;
}
