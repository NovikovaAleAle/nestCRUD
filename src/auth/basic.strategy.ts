import { BasicStrategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Credential } from '../credentials/credential.entity';

@Injectable()
export class AppBasicStrategy extends PassportStrategy(BasicStrategy) {
  constructor(private authSerice: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Partial<Credential>> {
    const credential = await this.authSerice.validateCredential(
      username,
      password,
    );
    if (!credential) {
      throw new UnauthorizedException();
    }
    return credential;
  }
}
