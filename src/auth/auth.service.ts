import { Injectable } from '@nestjs/common';
import { CredentialService } from 'src/credentials/credential.service';
import { Credential } from '../credentials/credential.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from 'src/dto/output.dto/token.dto';
import { isMatch } from './bcrypt.pass';

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
    if (credential && (await isMatch(pass, credential.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = credential;
      return result;
    }
    return null;
  }

  async login(credential: Partial<Credential>): Promise<TokenDto> {
    const payload = { username: credential.username, id: credential.id };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
