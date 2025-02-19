import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeleteResult } from 'typeorm';
import { User } from './user.entity';
import { ErrorNotFound } from './error/error-not-found';
import { producer } from '../config/kafka.config';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userDto: UserDto): Promise<void> {
    const user: User = await this.usersRepository.save(userDto);
    await producer.connect();
    await producer.send({
      topic: 'test-topic',
      messages: [{ value: `User ${JSON.stringify(user.id)} created.` }],
    });
    console.log('Message create user sended');
    await producer.disconnect();
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find();
  }

  async findId(id: number): Promise<User> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new ErrorNotFound('User not found');
    }
    return user;
  }

  async deleteId(id: number): Promise<void> {
    const result: DeleteResult = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new ErrorNotFound('User not found');
    }
  }

  async updateId(id: number, userParam: Partial<User>): Promise<void> {
    const user: User | null = await this.usersRepository.findOneBy({ id });
    if (user) {
      Object.assign(user, userParam);
      await this.usersRepository.save(user);
    } else {
      throw new ErrorNotFound('User not found');
    }
  }
}
