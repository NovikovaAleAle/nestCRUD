import { Injectable } from '@nestjs/common';
import { Credential } from './credential.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CredentialService {
  constructor(
    @InjectRepository(Credential)
      private credentialsRepository: Repository<Credential>,
    ) {}

  async findOne(username: string): Promise<Credential | null> {
    const count = await this.credentialsRepository.count();
    const cred = await this.credentialsRepository.findOneBy({ username });
    console.log('sfddsfd', cred, count);
    return cred;    
  }
}
