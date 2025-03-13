import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parseStringEnv } from 'src/helpers/parse.env.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: parseStringEnv('JWT_SECRET_KEY'),
    });
  }
  validate(payload: any) {
    return { id: payload.sub, username: payload.username };
  }
}
