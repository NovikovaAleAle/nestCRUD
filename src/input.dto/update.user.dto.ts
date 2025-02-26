import { PartialType } from '@nestjs/swagger';
import { InputUserDto } from './input.user.dto';

export class UpdateUserDto extends PartialType(InputUserDto) {}
