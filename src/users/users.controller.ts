import {
  Body,
  Query,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
  Logger,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { PageOptionsDto } from './dto/page.options.dto';
import { PageDto } from './dto/page.dto';
import { User } from './user.entity';
import { errorsHandler } from './error/errors.handler';
import { ErrorNotFound } from './error/error-not-found';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';


@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User creation message',
    type: String,
  })
  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<string> {
    try {
      await this.usersService.create(createUserDto);
      return 'User created';
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(error as Error);
    }
  }

  @ApiOperation({ summary: 'Search for all users with pagination' })
  @ApiResponse({
    status: 200,
    description: 'The found records',
    type: PageDto<User>,
  })
  @Get()
  async findAllWithPagination(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    try {
      const pageUsers = await this.usersService.findAllWithPagination(pageOptionsDto);
      return pageUsers;
    } catch (error) {
      this.logger.error(error);
      throw errorsHandler(error as Error);
    }
  }

  @ApiOperation({ summary: 'Search the user by id' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: User,
  })
  @Get(':id')
  async findId(@Param('id') id: string): Promise<User> {
    try {
      const idParam: number = parseInt(id);
      const user: User = await this.usersService.findId(idParam);
      return user;
    } catch (error) {
      this.logger.error(`User id:${id} findId, ${error}`);
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }

  @ApiOperation({ summary: 'Delete the user by id' })
  @ApiResponse({
    status: 200,
    description: 'User delete message',
    type: String,
  })
  @Delete(':id')
  async deleteId(@Param('id') id: string): Promise<string> {
    try {
      const idParam: number = parseInt(id);
      await this.usersService.deleteId(idParam);
      return 'User deleted';
    } catch (error) {
      this.logger.error(`User id:${id} deleteId, ${error}`);
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }

  @ApiOperation({ summary: 'Update the user by id' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'User update message',
    type: String,
  })
  @Patch(':id')
  async updateId(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<string> {
    try {
      const idParam: number = parseInt(id);
      await Promise.resolve(this.usersService.updateId(idParam, updateUserDto));
      return 'User updated';
    } catch (error) {
      this.logger.error(`User id:${id} updateId, ${error}`);
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }
}
