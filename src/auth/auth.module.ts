import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialModule } from 'src/credentials/credential.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    CredentialModule,
    PassportModule,
    JwtModule.register({
      secret: 'fffg',
      signOptions: { expiresIn: '60s' },
    }),
  ],
  providers: [AuthService, AppBasicStrategy, JwtStrategy],
})
export class AuthModule {}
