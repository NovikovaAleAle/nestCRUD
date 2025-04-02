import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, Length, IsNotEmpty } from 'class-validator';

export class InputPostDto {
  @ApiProperty({ description: 'The title of the post' })
  @IsNotEmpty()
  @IsString()
  @Length(10, 50)
  readonly title: string;

  @ApiProperty({ description: 'The content of the post' })
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  readonly content: string;
}
