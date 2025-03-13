import { Controller, UseGuards, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './basic.auth.guard';
import { ApiBasicAuth } from '@nestjs/swagger';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @Get('login')
  async login(@Req() req: Request): Promise<object>{
    console.log('reqUser:', req.user);
    return await this.authService.login(req.user);
  }
}
