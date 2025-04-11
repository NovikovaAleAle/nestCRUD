import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CredentialsService } from '../credentials/credentials.service';
import { Credential } from '../credentials/credential.entity';
import { JwtService } from '@nestjs/jwt';
import { TokenDto } from '../dto/output.dto/token.dto';
import { isMatch } from '../helpers/bcrypt.pass.helper';
import { MailService } from '../mail/mail.service';
import { InputUuidDto } from '../dto/input.dto/input.uuid.dto';
import { Role } from '../config/constants';
import { UsersService } from '../users/users.service';
import { UserRoleDto } from '../dto/interfaces';
import { ErrorCredentialNotFound } from '../error/error.credential-not-found';
import { TokenUuidService } from '../token.uuid/token.uuid.service';
import { parseIntEnv } from '../helpers/parse.env.helper';
import { Env } from '../config/constants';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly tokenUuidService: TokenUuidService,
  ) {}

  async validateCredential(
    username: string,
    pass: string,
  ): Promise<Partial<Credential> | null> {
    const credential = await this.credentialsService.findOneUsername(username);
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

  async confirm(inputUuid: InputUuidDto): Promise<void> {
    const currentTimeMinusLifeTimeUuid =
      new Date().getTime() - parseIntEnv(Env.UUID_LIFE_TIME);
    const tokenUuid = await this.tokenUuidService.validate(
      inputUuid.uuid,
      currentTimeMinusLifeTimeUuid,
    );
    try {
      const user: UserRoleDto = await this.usersService.findUserRolebyId(
        tokenUuid.userId,
      );
      if (user.role !== Role.USER) {
        await this.usersService.setRole(user.id, Role.USER);
        await this.tokenUuidService.activationTokenUuid(tokenUuid.uuid);
        this.logger.log(`Email user id: ${user.id} comfirmed`);
      } else {
        this.logger.warn(`User id:${user.id}, role already exist`);
        throw new ConflictException(`This email was already comfirmed`);
      }
    } catch (error) {
      if (!(error instanceof ConflictException)) {
        this.logger.warn(error);
      }
      throw error;
    }
  }

  async reconfirm(credential: Partial<Credential>): Promise<void> {
    if (credential.id) {
      const user: UserRoleDto =
        await this.usersService.findUserRolebyIdCredential(credential.id);
      if (user.role === Role.USER) {
        this.logger.warn(`User id:${user.id}, role already exist`);
        throw new ConflictException(`This email was already comfirmed`);
      }
      await this.mailService.sendUserConfirmation(user.id, credential);
      this.logger.log(`Confirmation id:${credential.id} email sent`);
    }
  }
}
