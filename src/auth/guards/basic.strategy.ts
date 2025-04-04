import { BasicStrategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Credential } from 'src/credentials/credential.entity';

@Injectable()
export class AppBasicStrategy extends PassportStrategy(BasicStrategy) {
  private readonly logger = new Logger(AppBasicStrategy.name);
  constructor(private readonly authSerice: AuthService) {
    super();
  }

  async validate(
    username: string,
    password: string,
  ): Promise<Partial<Credential>> {
    try {
      const credential = await this.authSerice.validateCredential(
        username,
        password,
      );
      if (!credential) {
        this.logger.warn(`Credential ${username} unauthorized`);
        throw new UnauthorizedException();
      }
      this.logger.log(`Credential ${username} found`);
      return credential;
    } catch (error) {
      this.logger.error(`Basic Auth validate, ${error}`);
      throw new UnauthorizedException();
    }
  }
}
