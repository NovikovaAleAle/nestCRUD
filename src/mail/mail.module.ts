import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import mailerConfig from '../config/mailer.config';
import { TokenUuidModule } from '../token.uuid/token.uuid.module';

@Module({
  imports: [
    MailerModule.forRootAsync(mailerConfig.asProvider()),
    TokenUuidModule,
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
