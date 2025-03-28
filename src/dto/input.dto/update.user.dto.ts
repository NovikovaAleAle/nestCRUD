import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create.user.dto';
import { InputUserDto } from './input.user.dto';
import { InputCredentialDto } from './input.credential.dto';
import { Type } from 'class-transformer';
import { Validate, ValidateNested } from 'class-validator';

class UpdateInputUserDto extends PartialType(InputUserDto) {}
class UpdateCredentialDto extends PartialType(InputCredentialDto) {}


export class UpdateUserDto {
    @ApiPropertyOptional({ description: 'User data', type: () => UpdateInputUserDto })
    @ValidateNested()
    @Type(() => UpdateInputUserDto)
    readonly user: UpdateInputUserDto;
    
    @ApiPropertyOptional({ description: 'Credential data', type: () => UpdateCredentialDto })
    @ValidateNested()
    @Type(() => UpdateCredentialDto)
    readonly credential: UpdateCredentialDto;
}
