import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialModule } from '../credentials/credential.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './basic.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { MailModule } from '../mail/mail.module';
//import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [CredentialModule, PassportModule, MailModule, UsersModule],
  providers: [AuthService, AppBasicStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
