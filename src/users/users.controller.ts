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
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { InputUserDto } from '../dto/input.dto/input.user.dto';
import { UpdateUserDto } from '../dto/input.dto/update.user.dto';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { PageDto } from '../dto/output.dto/page.dto';
import { User } from './user.entity';
import { errorsHandler } from '../error/errors.handler';
import { ErrorNotFound } from '../error/error-not-found';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { OutputUserDto } from 'src/dto/output.dto/output.user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: 'Create user' })
  @ApiBody({ type: InputUserDto })
  @ApiResponse({
    status: 200,
    description: 'User creation message',
    type: String,
  })
  @Post()
  async create(@Body() inputUserDto: InputUserDto): Promise<string> {
    try {
      await this.usersService.create(inputUserDto);
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
    type: PageDto<OutputUserDto>,
  })
  @Get()
  async findAllWithPagination(
    @Query() pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<OutputUserDto>> {
    try {
      const pageUsers =
        await this.usersService.findAllWithPagination(pageOptionsDto);
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
    type: OutputUserDto,
  })
  @Get(':id')
  async findId(@Param('id', ParseIntPipe) id: number): Promise<OutputUserDto> {
    try {
      const outputUser: User = await this.usersService.findId(id);
      return outputUser;
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
  async deleteId(@Param('id', ParseIntPipe) id: number): Promise<string> {
    try {
      await this.usersService.deleteId(id);
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<string> {
    try {
      await this.usersService.updateId(id, updateUserDto);
      return 'User updated';
    } catch (error) {
      this.logger.error(`User id:${id} updateId, ${error}`);
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }
}
