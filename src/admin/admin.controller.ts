import {
  Controller,
  Logger,
  UseGuards,
  ParseIntPipe,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  Get,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBasicAuth,
  ApiOperation,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { BasicAuthGuard } from '../auth/basic.auth.guard';
import { RolesGuard } from '../auth/roles/roles.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { Role } from '../config/constants';
import { CreateUserDto } from '../dto/input.dto/create.user.dto';
import { errorsHandler } from '../error/errors.handler';
import { ErrorUserNotFound } from '../error/error.user-not-found';
import { UpdateUserDto } from '../dto/input.dto/update.user.dto';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { PageDto } from '../dto/output.dto/page.dto';
import { OutputUserDto } from '../dto/output.dto/output.user.dto';
import { UsersService } from '../users/users.service';

@ApiTags('admin')
@UseGuards(BasicAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBasicAuth()
@Controller('admin')
export class AdminController {
  private readonly logger = new Logger(AdminController.name);

  constructor(
    private adminService: AdminService,
    private usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Create user with role USER' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User creation message',
    type: String,
  })
  @Post('users')
  async createUser(@Body() createUserDto: CreateUserDto): Promise<string> {
    try {
      await this.adminService.createUser(createUserDto);
      return 'User created';
    } catch (error) {
      this.logger.error(`createUser, ${error}`);
      throw errorsHandler(error as Error);
    }
  }

  @ApiOperation({ summary: 'Delete the user by id' })
  @ApiResponse({
    status: 200,
    description: 'User delete message',
    type: String,
  })
  @Delete('users/:id')
  async deleteUserById(@Param('id', ParseIntPipe) id: number): Promise<string> {
    try {
      await this.adminService.deleteUserById(id);
      return 'User deleted';
    } catch (error) {
      this.logger.error(`deleteUserById, user id:${id}, ${error}`);
      throw errorsHandler(error as Error | ErrorUserNotFound);
    }
  }

  @ApiOperation({ summary: 'Update the user by id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User update message',
    type: String,
  })
  @Patch('users/:id')
  async updateUserById(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<string> {
    try {
      await this.adminService.updateUserById(id, updateUserDto);
      return 'User updated';
    } catch (error) {
      this.logger.error(`updateUserById, user id:${id}, ${error}`);
      throw errorsHandler(error as Error | ErrorUserNotFound);
    }
  }

  @ApiOperation({ summary: 'Search for all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'The found records',
    type: PageDto<OutputUserDto>,
  })
  @Get('users')
  async findAllUsersWithPagination(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<OutputUserDto>> {
    try {
      const pageUsers: PageDto<OutputUserDto> =
        await this.usersService.findAllWithPagination(pageOptionsDto);
      return pageUsers;
    } catch (error) {
      this.logger.error(`findAllUsersWithPagination, ${error}`);
      throw errorsHandler(error as Error);
    }
  }

  @ApiOperation({ summary: 'Search the user by id' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: OutputUserDto,
  })
  @Get('users/:id')
  async findId(@Param('id', ParseIntPipe) id: number): Promise<OutputUserDto> {
    try {
      const outputUser: OutputUserDto =
        await this.adminService.findUserById(id);
      return outputUser;
    } catch (error) {
      this.logger.error(`findUserById, user id:${id}, ${error}`);
      throw errorsHandler(error as Error | ErrorUserNotFound);
    }
  }
}
