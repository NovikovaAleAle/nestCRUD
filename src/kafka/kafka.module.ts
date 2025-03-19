import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { ClientsModule, Transport, ClientKafka } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { Partitioners } from 'kafkajs';
import kafkaConfig from '../config/kafka.config';
import { AppConstant } from '../config/constants';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule.forFeature(kafkaConfig)],
        name: AppConstant.CLIENT_KAFKA_NAME,
        useFactory: (config: ConfigType<typeof kafkaConfig>) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [config.broker],
            },
            producer: {
              topic: config.topic,
              createPartitioner: Partitioners.DefaultPartitioner,
            },
            consumer: {
              groupId: config.groupId,
            },
          },
        }),
        inject: [kafkaConfig.KEY],
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule implements OnApplicationBootstrap {
  constructor(@Inject(AppConstant.CLIENT_KAFKA_NAME) private clientKafka: ClientKafka) {}

  async onApplicationBootstrap() {
    await this.clientKafka.connect();
  }
}
