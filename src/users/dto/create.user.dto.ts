import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'Name of the user' })
  readonly name: string;

  @ApiProperty({ description: 'Surname of the user' })
  readonly surname: string;

  @ApiProperty({ description: 'Age of the user' })
  readonly age: number;
}
