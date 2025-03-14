import { Injectable, Logger } from '@nestjs/common';
import { Credential } from './credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CredentialService {
  private readonly logger = new Logger(CredentialService.name);
  constructor(
    @InjectRepository(Credential)
    private credentialsRepository: Repository<Credential>,
  ) {}

  async findOne(username: string): Promise<Credential | null> {
    const credential: Credential | null =
      await this.credentialsRepository.findOneBy({ username });
    if (!credential) {
      this.logger.warn('Credential not found');
    }
    return credential;
  }
}
