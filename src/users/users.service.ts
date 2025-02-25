import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { ErrorNotFound } from './error/error-not-found';
import { producer } from '../config/kafka.config';
import { CreateUserDto } from './dto/create.user.dto';
import { PageOptionsDto } from './dto/page.options.dto';
import { PageDto } from './dto/page.dto';
import { PageMetaDto } from './dto/page.meta.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<void> {
    const user: User = await this.usersRepository.save(createUserDto);
    await producer.connect();
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: `User ${JSON.stringify(user.id)} created.` }],
    });
    this.logger.log('User creation message sent');
    await producer.disconnect();
    this.logger.log(`User id:${user.id} created`);
  }

  async findAllWithPagination(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<User>> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    const totalItemCount: number = await queryBuilder.getCount();
    const users: User[] = await queryBuilder
      .skip(pageOptionsDto.getSkip)
      .take(pageOptionsDto.take)
      .getRawMany();
    const pageMetaDto = new PageMetaDto(totalItemCount, pageOptionsDto);
    this.logger.log('Uploading a list of users ');
    return new PageDto(users, pageMetaDto);
  }

  async findId(id: number): Promise<User> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User with id:${id} not found`);
      throw new ErrorNotFound('User not found');
    }
    this.logger.log(`User with id:${id} found`);
    return user;
  }

  async deleteId(id: number): Promise<void> {
    const result: DeleteResult = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      this.logger.warn(`User to delete with id:${id} not found`);
      throw new ErrorNotFound('User not found');
    }
    this.logger.log(`User with id:${id} deleted`);
  }

  async updateId(id: number, userParam: Partial<User>): Promise<void> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (user) {
      Object.assign(user, userParam);
      await this.usersRepository.save(user);
    } else {
      this.logger.warn(`User to update with id:${id} not found`);
      throw new ErrorNotFound('User not found');
    }
    this.logger.log(`User with id:${id} updated`);
  }
}
