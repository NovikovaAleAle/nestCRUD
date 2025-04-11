import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialsModule } from '../credentials/credentials.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './guards/basic.strategy';
import { JwtStrategy } from './guards/jwt.strategy';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { TokenUuidModule } from '../token.uuid/token.uuid.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    CredentialsModule,
    MailModule,
    TokenUuidModule,
  ],
  providers: [AuthService, AppBasicStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
