import { Injectable } from '@nestjs/common';
import { CredentialService } from 'src/credentials/credential.service';
import { Credential } from '../credentials/credential.entity';

@Injectable()
export class AuthService {
  constructor(private credentialService: CredentialService) {}

  async validateCredential(
    username: string,
    pass: string,
  ): Promise<Partial<Credential> | null> {
    const credential = await this.credentialService.findOne(username);
    if (credential && credential.password === pass) {
      const { password, ...result } = credential;
      console.log(password);
      return result;
    }
    return null;
  }
}
