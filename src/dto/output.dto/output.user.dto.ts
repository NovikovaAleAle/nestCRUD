import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  MinLength,
  IsInt,
  Min,
  Matches,
} from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class OutputUserDto {
  @ApiProperty({ example: 1, description: 'User ID' })
  @IsInt()
  @Expose()
  readonly id: number;

  @ApiProperty({ example: 'Lilu', description: 'The name of the user' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z -]{3,20}$/)
  @Expose()
  readonly username: string;

  @ApiProperty({ example: 'Dallas', description: 'The surname of the user' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z' -]{3,20}$/)
  @Expose()
  readonly surname: string;

  @ApiProperty({ example: 18, description: 'The age of the user' })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Expose()
  readonly age: number;
}
