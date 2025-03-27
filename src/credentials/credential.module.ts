import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from './credential.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credential])],
  providers: [CredentialService],
  exports: [CredentialService],
})
export class CredentialModule {}
