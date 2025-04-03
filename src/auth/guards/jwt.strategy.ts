import { ExtractJwt, Strategy } from 'passport-jwt';
import { Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { parseStringEnv } from '../../helpers/parse.env.helper';
import { Env } from '../../config/constants';
import { RoleCredentialDto } from '../../dto/role.credential.dto';

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
  validate(payload: RoleCredentialDto) {
    const roleCredential: RoleCredentialDto = {
      id: payload.id,
      username: payload.username,
      role: payload.role,
    };
    this.logger.log(`Credential ${payload.username} confirmed`);
    return roleCredential;
  }
}
