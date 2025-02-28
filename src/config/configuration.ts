import { parseStringEnv, parseIntEnv } from '../helpers/parse.env.helper';

export default () => ({
  port: parseIntEnv('PORT'),
  database: {
    host: parseStringEnv('DATABASE_HOST'),
    port: parseIntEnv('DATABASE_PORT'),
    username: parseStringEnv('DATABASE_USERNAME'),
    password: parseStringEnv('DATABASE_PASSWORD'),
    database: parseStringEnv('DATABASE'),
  },
});
