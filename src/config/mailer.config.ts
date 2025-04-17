import { registerAs } from '@nestjs/config';
import {
  parseStringEnv,
  parseIntEnv,
  parseBooleanEnv,
} from '../helpers/parse.env.helper';
import { Env } from './constants';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

export default registerAs('mailer', () => ({
  transport: {
    host: parseStringEnv(Env.MAILER_HOST),
    port: parseIntEnv(Env.MAILER_PORT),
    secure: parseBooleanEnv(Env.MAILER_USER_SECURE),
    auth: {
      user: parseStringEnv(Env.MAILER_USER),
      pass: parseStringEnv(Env.MAILER_PASSWORD),
    },
    tls: {
      rejectUnauthorized: false,
    },
  },
  defaults: {
    from: '"nest-app" <n_alena_a@mail.ru>',
  },
  template: {
    dir: join(__dirname, '../', 'mail/', '/templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
}));
