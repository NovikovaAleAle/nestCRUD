import { registerAs } from '@nestjs/config';
import { parseStringEnv, parseIntEnv } from '../helpers/parse.env.helper';

export default registerAs('database', () => ({
  host: parseStringEnv('DATABASE_HOST'),
  port: parseIntEnv('DATABASE_PORT'),
  username: parseStringEnv('DATABASE_USERNAME'),
  password: parseStringEnv('DATABASE_PASSWORD'),
  database: parseStringEnv('DATABASE'),
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
}));
