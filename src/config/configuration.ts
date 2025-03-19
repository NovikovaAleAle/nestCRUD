import { parseStringEnv, parseIntEnv } from '../helpers/parse.env.helper';

export default () => ({
  port: parseIntEnv('PORT'),
  jwt: {
    secretKey: parseStringEnv('JWT_SECRET_KEY'),
  },
  credential: {
    username: parseStringEnv('CREDENTIAL_USERNAME'),
    password: parseStringEnv('CREDENTIAL_PASSWORD'),
  },
});
