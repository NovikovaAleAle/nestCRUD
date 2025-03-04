import { Logger, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { ErrorNotFound } from '../error/error-not-found';
import { InputUserDto } from '../dto/input.dto/input.user.dto';
import { PageOptionsDto } from '../dto/input.dto/page.options.dto';
import { PageDto } from '../dto/output.dto/page.dto';
import { PageMetaDto } from '../dto/page.meta.dto';
import { OutputUserDto } from 'src/dto/output.dto/output.user.dto';
import { UpdateUserDto } from 'src/dto/input.dto/update.user.dto';
import { plainToClass } from 'class-transformer';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly kafkaServise: KafkaService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(inputUserDto: InputUserDto): Promise<void> {
    const user: User = await this.usersRepository.save(inputUserDto);
    this.kafkaServise.sendMessage(`User id:${user.id} created`);
    this.logger.log(`User id:${user.id} created`);
  }

  async findAllWithPagination(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<OutputUserDto>> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');
    const totalItemCount: number = await queryBuilder.getCount();
    const users: User[] = await queryBuilder
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
    return new PageDto(outputUsers, pageMetaDto);
  }

  async findId(id: number): Promise<OutputUserDto> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      this.logger.warn(`User with id:${id} not found`);
      throw new ErrorNotFound('User not found');
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
      throw new ErrorNotFound('User not found');
    }
    this.logger.log(`User with id:${id} deleted`);
  }

  async updateId(id: number, updateUserDto: UpdateUserDto): Promise<void> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (user) {
      Object.assign(user, updateUserDto);
      await this.usersRepository.save(user);
    } else {
      this.logger.warn(`User to update with id:${id} not found`);
      throw new ErrorNotFound('User not found');
    }
    this.logger.log(`User with id:${id} updated`);
  }
}
