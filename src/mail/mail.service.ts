import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Credential } from '../credentials/credential.entity';
//import { JwtService } from '@nestjs/jwt';
import { CustomSentMessageInfo } from '../dto/interfaces';
import { ErrorEmailNotSent } from '../error/error.email-not-sent';
import { TokenUuidService } from '../token.uuid/token.uuid.service';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    //private readonly jwtService: JwtService,
    private readonly tokenUuidService: TokenUuidService,
  ) {}

  async sendUserConfirmation(userId:number, credential: Partial<Credential>): Promise<void> {
    /*const payload = {
      username: credential.username,
      id: credential.id,
      email: credential.email,
    };
    */
    const token = await this.tokenUuidService.create(userId);
    const url = `http://127.0.0.1:3000/auth/confirm?token=${token.uuid}`;
    try {
      const sendmailinfo = (await this.mailerService.sendMail({
        to: credential.email,
        subject: 'Welcome to userCRUD app! Confirm your Email',
        template: './confirmation',
        context: { name: credential.username, link: url },
      })) as CustomSentMessageInfo;
      this.logger.log(`Email response:${sendmailinfo.response}`);
    } catch (error) {
      this.logger.warn(
        `Confirmation id:${credential.id} email not sent ${error}`,
      );
      throw new ErrorEmailNotSent();
    }
  }
}
