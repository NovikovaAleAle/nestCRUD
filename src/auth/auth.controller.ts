import {
  Controller,
  UseGuards,
  Req,
  Get,
  Post,
  Body,
  UnauthorizedException,
  Logger,
  Query,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { BasicAuthGuard } from './basic.auth.guard';
import {
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { TokenDto } from '../dto/output.dto/token.dto';
import { InputCredentialDto } from '../dto/input.dto/input.credential.dto';
import { InputTokenDto } from 'src/dto/input.dto/input.token.dto';
import { errorsHandler } from 'src/error/errors.handler';
import { ErrorCredentialNotFound } from 'src/error/error.credential-not-found';
import { AuthorizateGuard } from './authorizate/authorizate.guard';
//import { Authorizate } from './authorizate/authorizate.decorator';
import { ErrorEmailNotSent } from 'src/error/error.email-not-sent';

@Controller('auth')
export class AuthController {
  private logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @UseGuards(BasicAuthGuard, AuthorizateGuard)
  //@Authorizate(true)
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

  @ApiOperation({ summary: 'Register credential' })
  @ApiBody({ type: InputCredentialDto })
  @ApiResponse({
    status: 200,
    description: 'Message about the need to confirm registration',
    type: String,
  })
  @Post('register')
  async signUp(@Body() inputCredential: InputCredentialDto): Promise<string> {
    try {
      await this.authService.signUp(inputCredential);
      return 'Complete registration with email confirmation';
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(
        error as Error | ConflictException | ErrorEmailNotSent,
      );
    }
  }

  @ApiOperation({ summary: 'Сredential confirmation at the link' })
  @ApiResponse({
    status: 200,
    description: 'Сredential confirmation message',
    type: String,
  })
  @Get('confirm')
  async confirm(@Query() inputToken: InputTokenDto): Promise<string> {
    try {
      await this.authService.confirm(inputToken);
      return 'Email confirm';
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(error as Error | ErrorCredentialNotFound);
    }
  }

  @UseGuards(BasicAuthGuard, AuthorizateGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Сredential reconfirmation at the link' })
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
