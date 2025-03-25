import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InputTokenDto {
  @ApiProperty({ description: 'JWT token' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/)
  readonly token: string;
}
