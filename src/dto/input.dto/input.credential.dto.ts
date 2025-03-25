import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InputCredentialDto {
  @ApiProperty({
    description: 'The name of the user credentials',
    uniqueItems: true,
  })
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  readonly username: string;

  @ApiProperty({ description: 'The password of the user credentials' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 20)
  readonly password: string;

  @ApiProperty({ description: 'The email of the user credentials' })
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;
}
