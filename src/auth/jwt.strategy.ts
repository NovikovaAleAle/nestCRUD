import { ExtractJwt, Strategy } from 'passport-jwt';
import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parseStringEnv } from '../helpers/parse.env.helper';
import { Credential } from '../credentials/credential.entity';
import { Env } from '../config/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: parseStringEnv(Env.JWT_SECRET_KEY),
    });
  }
  validate(payload: Partial<Credential>) {
    return { id: payload.id, username: payload.username };
  }
}
