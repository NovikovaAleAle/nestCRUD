import {
  Controller,
  UseGuards,
  Req,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './basic.auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { TokenDto } from 'src/dto/output.dto/token.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @Get('login')
  async login(@Req() req: Request): Promise<TokenDto> {
    if (!req.user) {
      throw new UnauthorizedException();
    }
    return await this.authService.login(req.user);
  }
}
