import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parseStringEnv } from '../../helpers/parse.env.helper';
import { Credential } from '../../credentials/credential.entity';
import { Env } from '../../config/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: parseStringEnv(Env.JWT_SECRET_KEY),
    });
  }
  validate(payload: Partial<Credential>) {
    const credential: Partial<Credential> = {
      id: payload.id,
      username: payload.username,
    };
    this.logger.log(`Credential ${payload.username} confirmed`);
    return credential;
  }
}
