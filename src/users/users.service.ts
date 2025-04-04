import { Logger, Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { ErrorUserNotFound } from '../error/error.user-not-found';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { PageUsersDto } from '../dto/output.dto/page.users.dto';
import { PageMetaDto } from '../dto/page.meta.dto';
import { OutputUserDto } from '../dto/output.dto/output.user.dto';
import { UpdateUserDto } from '../dto/input.dto/update.user.dto';
import { plainToClass } from 'class-transformer';
import { KafkaService } from '../kafka/kafka.service';
import { Credential } from '../credentials/credential.entity';
import { CreateUserDto } from '../dto/input.dto/create.user.dto';
import { Role } from '../config/constants';
import { UserRoleDto } from '../dto/interfaces';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly kafkaServise: KafkaService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<number> {
    const toCredential = plainToClass(Credential, createUserDto.credential, {
      excludeExtraneousValues: true,
    });
    const toUser = plainToClass(User, createUserDto.user, {
      excludeExtraneousValues: true,
    });
    toUser.credential = toCredential;
    try {
      const user: User = await this.usersRepository.save(toUser);
      this.kafkaServise.sendMessage(`User id:${user.id} created`);
      this.logger.log(`User id:${user.id} created`);
      return user.id;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        this.logger.warn(
          `User with username ${toCredential.username} already exist`,
        );
        throw new ConflictException('User with this username already exist');
      }
      throw error;
    }
  }

  async setRole(userId: number, role: Role): Promise<void> {
    const id = userId;
    const updatableUser: User | null = await this.usersRepository.findOneBy({
      id,
    });
    if (!updatableUser) {
      this.logger.warn(`UpdatableUser with id:${userId} not found`);
      throw new ErrorUserNotFound();
    }
    if (updatableUser.role === role) {
      this.logger.warn(`The role for user id:${userId} already exist`);
      throw new ConflictException();
    }
    updatableUser.role = role;
    await this.usersRepository.save(updatableUser);
    this.logger.log(`Role ${role} for user id: ${userId} set`);
  }

  async findAllWithPagination(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageUsersDto<OutputUserDto>> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    const totalItemCount: number = await queryBuilder.getCount();
    const users: User[] = await queryBuilder
      .orderBy('user.id')
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getMany();
    const outputUsers: OutputUserDto[] = users.map((user) =>
      plainToClass(OutputUserDto, user, {
        excludeExtraneousValues: true,
      }),
    );
    const pageMetaDto = new PageMetaDto(totalItemCount, pageOptionsDto);
    this.logger.log('Uploading a list of users');
    return new PageUsersDto(outputUsers, pageMetaDto);
  }

  async findId(id: number): Promise<OutputUserDto> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User with id:${id} not found`);
      throw new ErrorUserNotFound();
    }
    const outputUser = plainToClass(OutputUserDto, user, {
      excludeExtraneousValues: true,
    });
    this.logger.log(`User with id:${id} found`);
    return outputUser;
  }

  async deleteId(id: number): Promise<void> {
    const result: DeleteResult = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`User to delete with id:${id} not found`);
      throw new ErrorUserNotFound();
    }
    this.logger.log(`User with id:${id} deleted`);
  }

  async updateId(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (user) {
      if (updateUserDto.credential) {
        Object.assign(user.credential, updateUserDto.credential);
      }
      Object.assign(user, updateUserDto.user);
      await this.usersRepository.save(user);
    } else {
      this.logger.warn(`User to update with id:${id} not found`);
      throw new ErrorUserNotFound();
    }
    this.logger.log(`User with id:${id} updated`);
  }

  async findUserRolebyIdCredential(credentialId: number): Promise<UserRoleDto> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    const user: User | null = await queryBuilder
      .innerJoinAndSelect('user.credential', 'credential')
      .where('credential.id = :credentialId', { credentialId })
      .getOne();
    if (!user) {
      this.logger.warn(`User for credential id:${credentialId} not found`);
      throw new ErrorUserNotFound();
    }
    this.logger.log(`User role for credential id:${credentialId} found`);
    return { id: user.id, role: user.role };
  }

  async findIdForPost(id: number): Promise<User> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User with id:${id} not found`);
      throw new ErrorUserNotFound();
    }
    this.logger.log(`User with id:${id} found`);
    return user;
  }

  async findUserRolebyId(id: number): Promise<UserRoleDto> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User for credential id:${id} not found`);
      throw new ErrorUserNotFound();
    }
    this.logger.log(`User role for credential id:${id} found`);
    return { id: user.id, role: user.role };
  }
}
