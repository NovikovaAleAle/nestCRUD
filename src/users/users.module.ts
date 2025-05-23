import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule, InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { KafkaModule } from '../kafka/kafka.module';
import { Repository } from 'typeorm';
import { Credential } from '../credentials/credential.entity';
import { Role } from '../config/constants';
import { parseIntEnv, parseStringEnv } from '../helpers/parse.env.helper';
import { Env } from '../config/constants';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), KafkaModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule implements OnModuleInit {
  private readonly logger = new Logger(UsersModule.name);
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}
  async onModuleInit() {
    if ((await this.userRepository.count()) === 0) {
      const credential = new Credential();
      credential.username = parseStringEnv(Env.CREDENTIAL_USERNAME);
      credential.password = parseStringEnv(Env.CREDENTIAL_PASSWORD);
      credential.email = parseStringEnv(Env.CREDENTIAL_EMAIL);
      await this.userRepository.save({
        name: parseStringEnv(Env.ADMIN_NAME),
        surname: parseStringEnv(Env.ADMIN_SURNAME),
        age: parseIntEnv(Env.ADMIN_AGE),
        role: Role.ADMIN,
        credential: credential,
      });
      this.logger.log('Admin created');
    }
  }
}
