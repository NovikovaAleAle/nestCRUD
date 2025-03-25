import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import mailerConfig from '../config/mailer.config';

@Module({
  imports: [MailerModule.forRootAsync(mailerConfig.asProvider())],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
