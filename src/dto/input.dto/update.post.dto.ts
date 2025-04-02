import { PartialType } from '@nestjs/swagger';
import { InputPostDto } from './input.post.dto';

export class UpdatePostDto extends PartialType(InputPostDto) {}
