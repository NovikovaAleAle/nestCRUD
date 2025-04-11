import { Injectable, Logger } from '@nestjs/common';
import { Credential } from './credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ErrorCredentialNotFound } from '../error/error.credential-not-found';

@Injectable()
export class CredentialsService {
  private readonly logger = new Logger(CredentialsService.name);
  constructor(
    @InjectRepository(Credential)
    private credentialsRepository: Repository<Credential>,
  ) {}

  async findOneUsername(username: string): Promise<Credential> {
    const credential = await this.credentialsRepository.findOneBy({ username });
    if (!credential) {
      this.logger.warn(`Credential ${username} not found`);
      throw new ErrorCredentialNotFound();
    }
    return credential;
  }

  async findOneId(id: number): Promise<Partial<Credential>> {
    const credential = await this.credentialsRepository.findOneBy({ id });
    if (!credential) {
      this.logger.warn(`Credential ${id} not found`);
      throw new ErrorCredentialNotFound();
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...result } = credential;
    return result;
  }
}
