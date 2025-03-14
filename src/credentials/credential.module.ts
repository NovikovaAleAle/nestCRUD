import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './credential.entity';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Credential]), ConfigModule],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule implements OnModuleInit {
  private readonly logger = new Logger(CredentialModule.name);
  constructor(
    @InjectRepository(Credential)
    private credentialRepository: Repository<Credential>,
    private readonly configService: ConfigService,
  ) {}
  async onModuleInit() {
    if ((await this.credentialRepository.count()) === 0) {
      await this.credentialRepository.save({
        username: this.configService.get<string>('credential.username'),
        password: this.configService.get<string>('credential.password'),
      });
      this.logger.log('First credential created');
    }
  }
}
