import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parseStringEnv } from 'src/helpers/parse.env.helper';
import { Credential } from 'src/credentials/credential.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: parseStringEnv('JWT_SECRET_KEY'),
    });
  }
  validate(payload: Partial<Credential>) {
    return { id: payload.id, username: payload.username };
  }
}
