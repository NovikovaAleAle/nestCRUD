import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialModule } from '../credentials/credential.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './guards/basic.strategy';
import { JwtStrategy } from './guards/jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [PassportModule, UsersModule, CredentialModule],
  providers: [AuthService, AppBasicStrategy, JwtStrategy, MailService],
  controllers: [AuthController],
})
export class AuthModule {}
