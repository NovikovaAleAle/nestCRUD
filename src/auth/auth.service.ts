import {
  ConflictException,
  Injectable,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CredentialService } from '../credentials/credential.service';
import { Credential } from '../credentials/credential.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from '../dto/output.dto/token.dto';
import { isMatch } from '../helpers/bcrypt.pass.helper';
import { MailService } from '../mail/mail.service';
import { InputTokenDto } from '../dto/input.dto/input.token.dto';
import { Role } from '../config/constants';
import { UsersService } from '../users/users.service';
import { UserRoleDto } from '../dto/user.role.dto';
import { ErrorCredentialNotFound } from 'src/error/error.credential-not-found';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly credentialService: CredentialService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateCredential(
    username: string,
    pass: string,
  ): Promise<Partial<Credential> | null> {
    const credential = await this.credentialService.findOneUsername(username);
    if (credential && (await isMatch(pass, credential.password))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...result } = credential;
      return result;
    }
    return null;
  }

  async login(credential: Partial<Credential>): Promise<TokenDto> {
    const credentialId = credential.id;
    if (!credentialId) {
      throw new ErrorCredentialNotFound();
    }
    const userRole: UserRoleDto =
      await this.usersService.findUserRolebyIdCredential(credentialId);
    const payload = {
      username: credential.username,
      id: credential.id,
      role: userRole.role,
    };
    this.logger.log('JWT token created');
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async confirm(inputToken: InputTokenDto): Promise<void> {
    const payloadCredential: Partial<Credential> =
      await this.jwtService.verifyAsync(inputToken.token);
    const id = payloadCredential.id;
    if (!id || !payloadCredential.username) {
      throw new BadRequestException(`Invalid token`);
    }
    try {
      const credential = await this.credentialService.findOneId(id);
      if (credential.id && credential.username === payloadCredential.username) {
        const user: UserRoleDto =
          await this.usersService.findUserRolebyIdCredential(credential.id);
        if (user.role !== Role.USER) {
          await this.usersService.setRole(user.id, Role.USER);
          this.logger.log(`Email user id: ${user.id} comfirmed`);
        } else {
          this.logger.warn(`User id:${user.id}, role already exist`);
          throw new ConflictException(`This email was already comfirmed`);
        }
      }
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        this.logger.warn(error);
      }
      throw error;
    }
  }

  async reconfirm(credential: Partial<Credential>): Promise<void> {
    await this.mailService.sendUserConfirmation(credential);
    this.logger.log(`Confirmation id:${credential.id} email sent`);
  }
}
