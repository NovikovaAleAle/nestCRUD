import { Injectable } from '@nestjs/common';
import { CredentialService } from 'src/credentials/credential.service';
import { Credential } from '../credentials/credential.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private credentialService: CredentialService,
    private jwtService: JwtService,
  ) {}

  async validateCredential(
    username: string,
    pass: string,
  ): Promise<Partial<Credential> | null> {
    const credential = await this.credentialService.findOne(username);
    if (credential && credential.password === pass) {
      const { password, ...result } = credential;
      console.log(password);
      console.log('dcd', result);
      return result;
    }
    return null;
  }

  async login(credential: any): Promise<object> {
    const payload = { username: credential.username, sub: credential.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
