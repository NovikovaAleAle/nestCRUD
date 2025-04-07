import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialModule } from '../credentials/credential.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './guards/basic.strategy';
import { JwtStrategy } from './guards/jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { TokenUuidModule } from 'src/token.uuid/token.uuid.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    CredentialModule,
    MailModule,
    TokenUuidModule,
  ],
  providers: [AuthService, AppBasicStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
