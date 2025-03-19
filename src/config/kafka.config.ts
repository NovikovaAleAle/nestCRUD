import { registerAs } from '@nestjs/config';
import { parseStringEnv } from '../helpers/parse.env.helper';
import { Env } from './constants';

export default registerAs('kafka', () => ({
  broker: parseStringEnv(Env.KAFKA_BROKER),
  topic: parseStringEnv(Env.KAFKA_TOPIC),
  groupId: parseStringEnv(Env.KAFKA_GROUP_ID),
}));
