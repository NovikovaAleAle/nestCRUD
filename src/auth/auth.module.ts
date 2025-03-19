import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialModule } from '../credentials/credential.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    CredentialModule,
    PassportModule,
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  providers: [AuthService, AppBasicStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
