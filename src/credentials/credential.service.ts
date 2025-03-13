import { Injectable } from '@nestjs/common';
import { Credential } from './credential.entity';

@Injectable()
export class CredentialService {
  private readonly credentials = [
    {
      id: 1,
      username: 'admin',
      password: 'admin',
    },
    {
      id: 2,
      username: 'guess',
      password: 'guess',
    },
  ];
  async findOne(username: string): Promise<Credential | undefined> {
    return await Promise.resolve(
      this.credentials.find((credential) => credential.username === username),
    );
  }
}
