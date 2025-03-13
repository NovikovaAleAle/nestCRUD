import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CredentialModule } from 'src/credentials/credential.module';
import { PassportModule } from '@nestjs/passport';
import { AppBasicStrategy } from './basic.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    CredentialModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secretKey'),
        signOptions: { expiresIn: '5m' },
      }), 
    }),
  ],
  providers: [AuthService, AppBasicStrategy, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
