import {
  Post,
  Body,
  Controller,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { errorsHandler } from '../error/errors.handler';
import {
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreateUserDto } from 'src/dto/input.dto/create.user.dto';
import { ErrorEmailNotSent } from '../error/error.email-not-sent';
import { MailService } from '../mail/mail.service';

@Controller('users')
export class UsersController {

  private readonly logger = new Logger(UsersController.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
  ) {}

  @ApiOperation({ summary: 'Register user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Message about the need to confirm registration',
    type: String,
  })
  @Post('register')
  async create(@Body() createUserDto: CreateUserDto): Promise<string> {
    try {
      const userId: number = await this.usersService.create(createUserDto);
      await this.mailService.sendUserConfirmation(createUserDto.credential);
      this.logger.log(`Confirmation email sent user id:${userId}`);
      return 'Complete registration with email confirmation';
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(
        error as Error | ConflictException | ErrorEmailNotSent
      );
    }
  }
}
