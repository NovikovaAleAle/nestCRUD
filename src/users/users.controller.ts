import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { User } from './user.entity';
import { errorsHandler } from './error/errors.handler';
import { ErrorNotFound } from './error/error-not-found';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  async create(@Body() userDto: UserDto): Promise<string> {
    try {
      await this.usersService.create(userDto);
      return 'User created';
    } catch (error) {
      throw errorsHandler(error as Error);
    }
  }

  @Get()
  async findAll(): Promise<User[]> {
    try {
      const users: User[] = await this.usersService.findAll();
      return users;
    } catch (error) {
      throw errorsHandler(error as Error);
    }
  }

  @Get(':id')
  async findId(@Param('id') id: string): Promise<User> {
    try {
      const idParam: number = parseInt(id);
      const user: User = await this.usersService.findId(idParam);
      return user;
    } catch (error) {
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }

  @Delete(':id')
  async deleteId(@Param('id') id: string): Promise<string> {
    try {
      const idParam: number = parseInt(id);
      await this.usersService.deleteId(idParam);
      return 'User deleted';
    } catch (error) {
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }

  @Patch(':id')
  async updateId(
    @Param('id') id: string,
    @Body() updateUserDto: Partial<UserDto>,
  ): Promise<string> {
    try {
      const idParam: number = parseInt(id);
      await Promise.resolve(this.usersService.updateId(idParam, updateUserDto));
      return 'User updated';
    } catch (error) {
      throw errorsHandler(error as Error | ErrorNotFound);
    }
  }
}
