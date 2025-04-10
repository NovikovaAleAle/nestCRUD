import { registerAs } from '@nestjs/config';
import { parseStringEnv, parseIntEnv } from '../helpers/parse.env.helper';
import { Env } from './constants';

export default registerAs('minio', () => ({
  endPoint: parseStringEnv(Env.MINIO_ENDPOINT),
  port: parseIntEnv(Env.MINIO_API_PORT),
  useSSL: false,
  //temporarily, a minio user must be created
  accessKey: parseStringEnv(Env.MINIO_ROOT_USER),
  secretKey: parseStringEnv(Env.MINIO_ROOT_PASSWORD),
}));
