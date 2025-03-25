import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CredentialService } from '../credentials/credential.service';
import { Credential } from '../credentials/credential.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from '../dto/output.dto/token.dto';
import { isMatch } from './bcrypt.pass';
import { MailService } from '../mail/mail.service';
import { InputCredentialDto } from '../dto/input.dto/input.credential.dto';
import { InputTokenDto } from '../dto/input.dto/input.token.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private credentialService: CredentialService,
    private jwtService: JwtService,
    private mailService: MailService,
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
    const payload = {
      username: credential.username,
      id: credential.id,
      authorization: credential.authorization,
    };
    this.logger.log('JWT token created');
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(inputCredential: InputCredentialDto): Promise<void> {
    const credential: Partial<Credential> =
      await this.credentialService.signUp(inputCredential);
    await this.mailService.sendUserConfirmation(credential);
    this.logger.log(`Confirmation id:${credential.id} email sent`);
  }

  async confirm(inputToken: InputTokenDto): Promise<void> {
    const payloadCredential: Partial<Credential> =
      await this.jwtService.verifyAsync(inputToken.token);
    try {
      await this.credentialService.confirm(payloadCredential);
    } catch (error) {
      this.logger.warn(error);
      throw error;
    }
  }

  async reconfirm(credential: Partial<Credential>): Promise<void> {
    if (credential.authorization) {
      throw new ConflictException('Credential has already been confirmed');
    }
    await this.mailService.sendUserConfirmation(credential);
    this.logger.log(`Confirmation id:${credential.id} email sent`);
  }
}
