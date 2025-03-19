import { registerAs } from '@nestjs/config';
import { parseStringEnv } from '../helpers/parse.env.helper';

export default registerAs('kafka', () => ({
  broker: parseStringEnv('KAFKA_BROKER'),
  topic: parseStringEnv('KAFKA_TOPIC'),
  groupId: parseStringEnv('KAFKA_GROUP_ID'),
}));
