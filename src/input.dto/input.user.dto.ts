import { ApiProperty } from '@nestjs/swagger';

export class InputUserDto {
  @ApiProperty({ example: 'Lilu', description: 'The name of the user' })
  readonly name: string;

  @ApiProperty({ example: 'Dallas', description: 'The surname of the user' })
  readonly surname: string;

  @ApiProperty({ example: 18, description: 'The age of the user' })
  readonly age: number;
}
