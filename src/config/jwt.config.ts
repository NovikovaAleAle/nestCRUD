import { registerAs } from '@nestjs/config';
import { parseStringEnv } from '../helpers/parse.env.helper';
import { Env } from './constants';

export default registerAs('jwt', () => ({
  secret: parseStringEnv(Env.JWT_SECRET_KEY),
  signOptions: { expiresIn: parseStringEnv(Env.JWT_EXPIRES_IN) },
}));
