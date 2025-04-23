import {
  Controller,
  UseGuards,
  Req,
  Get,
  Query,
  UnauthorizedException,
  Logger,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './guards/basic.auth.guard';
import { ApiOperation, ApiResponse, ApiBasicAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { TokenDto } from '../dto/output.dto/token.dto';
import { InputUuidDto } from '../dto/input.dto/input.uuid.dto';
import { errorsHandler } from '../error/errors.handler';
import { ErrorEmailNotSent } from '../error/error.email-not-sent';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Login' })
  @ApiResponse({
    status: 200,
    description: 'JWT token',
  })
  @Get('login')
  async login(@Req() req: Request): Promise<TokenDto> {
    try {
      if (!req.user) {
        throw new Error('Request does not contain user data');
      }
      return await this.authService.login(req.user);
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException();
    }
  }

  @ApiOperation({ summary: 'Credential confirmation at the link' })
  @ApiResponse({
    status: 200,
    description: 'Credential confirmation message',
    type: String,
  })
  @Get('confirm')
  async confirm(@Query() inputUuid: InputUuidDto): Promise<string> {
    try {
      await this.authService.confirm(inputUuid);
      return 'Email confirm';
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(
        error as Error | BadRequestException | ConflictException,
      );
    }
  }

  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Credential reconfirmation at the link' })
  @ApiResponse({
    status: 200,
    description: 'Message about the need to confirm registration',
    type: String,
  })
  @Get('reconfirm')
  async reconfirm(@Req() req: Request): Promise<string> {
    try {
      if (!req.user) {
        throw new Error('Request does not contain user data');
      }
      await this.authService.reconfirm(req.user);
      return 'Complete registration with email confirmation';
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(
        error as Error | ConflictException | ErrorEmailNotSent,
      );
    }
  }
}
