import { registerAs } from '@nestjs/config';
import { parseStringEnv, parseIntEnv } from '../helpers/parse.env.helper';
import { Env } from './constants';

export default registerAs('database', () => ({
  host: parseStringEnv(Env.DATABASE_HOST),
  port: parseIntEnv(Env.DATABASE_PORT),
  username: parseStringEnv(Env.DATABASE_USERNAME),
  password: parseStringEnv(Env.DATABASE_PASSWORD),
  database: parseStringEnv(Env.DATABASE),
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
}));
