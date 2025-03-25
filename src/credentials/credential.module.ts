import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './credential.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hashedPassword } from '../auth/bcrypt.pass';
import { parseStringEnv } from '../helpers/parse.env.helper';
import { Env } from '../config/constants';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule implements OnModuleInit {
  private readonly logger = new Logger(CredentialModule.name);
  constructor(
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
  ) {}
  async onModuleInit() {
    if ((await this.credentialRepository.count()) === 0) {
      const hashPassword = await hashedPassword(
        parseStringEnv(Env.CREDENTIAL_PASSWORD),
      );
      await this.credentialRepository.save({
        username: parseStringEnv(Env.CREDENTIAL_USERNAME),
        password: hashPassword,
        email: parseStringEnv(Env.CREDENTIAL_EMAIL),
        authorization: true,
      });
      this.logger.log('First credential created');
    }
  }
}
