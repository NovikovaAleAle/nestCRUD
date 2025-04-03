import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsInt, Allow } from 'class-validator';
import { Expose, Exclude } from 'class-transformer';

@Exclude()
export class OutputPostDto {
  @ApiProperty({ description: 'Post ID' })
  @IsInt()
  @Expose()
  readonly id: number;

  @ApiProperty({ description: 'The title of the post' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly title: string;

  @ApiProperty({ description: 'The content of the post' })
  @Expose()
  @IsNotEmpty()
  @IsString()
  readonly content: string;

  @ApiProperty({
    description: 'Url of the image. May be null',
    nullable: true,
  })
  @Expose()
  @Allow()
  readonly image: string;
}
