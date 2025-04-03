import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../dto/input.dto/create.user.dto';
import { UpdateUserDto } from '../dto/input.dto/update.user.dto';
import { Role } from '../config/constants';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { PageUsersDto } from '../dto/output.dto/page.users.dto';
import { OutputUserDto } from '../dto/output.dto/output.user.dto';

@Injectable()
export class AdminService {
  //private readonly logger = new Logger(AdminService.name);
  constructor(private readonly usersService: UsersService) {}

  async createUser(createUserDto: CreateUserDto): Promise<void> {
    const userId: number = await this.usersService.create(createUserDto);
    await this.usersService.setRole(userId, Role.USER);
  }

  async deleteUserById(id: number): Promise<void> {
    await this.usersService.deleteId(id);
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<void> {
    await this.usersService.updateId(id, updateUserDto);
  }

  async findAllUsersWithPagination(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageUsersDto<OutputUserDto>> {
    return await this.usersService.findAllWithPagination(pageOptionsDto);
  }

  async findUserById(id: number): Promise<OutputUserDto> {
    return await this.usersService.findId(id);
  }

  async updateRoleOnUser(userId: number): Promise<void> {
    await this.usersService.setRole(userId, Role.USER);
  }
}
