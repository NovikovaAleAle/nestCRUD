import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Credential } from '../credentials/credential.entity';
import { JwtService } from '@nestjs/jwt';
import { CustomSentMessageInfo } from './sent.message.interface';
import { ErrorEmailNotSent } from '../error/error.email-not-sent';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  constructor(
    private readonly mailerService: MailerService,
    private readonly jwtService: JwtService,
  ) {}

  async sendUserConfirmation(credential: Partial<Credential>): Promise<void> {
    const payload = {
      username: credential.username,
      id: credential.id,
      email: credential.email,
    };
    const token = await this.jwtService.signAsync(payload);
    const url = `http://127.0.0.1:3000/auth/confirm?token=${token}`;
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
