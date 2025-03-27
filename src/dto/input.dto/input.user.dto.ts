import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  Min,
  Matches,
} from 'class-validator';

export class InputUserDto {
  @ApiProperty({ description: 'The name of the user' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z -]{3,20}$/)
  readonly name: string;

  @ApiProperty({ description: 'The surname of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z' -]{3,20}$/)
  readonly surname: string;

  @ApiProperty({ description: 'The age of the user' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  readonly age: number;
}
