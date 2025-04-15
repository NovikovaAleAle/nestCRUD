import { registerAs } from '@nestjs/config';
import { parseIntEnv } from '../helpers/parse.env.helper';
import { Env } from './constants';

export default registerAs('uuid', () => ({
  uuidLifeTime: parseIntEnv(Env.UUID_LIFE_TIME),
}));
