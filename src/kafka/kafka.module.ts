import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport, ClientKafka } from '@nestjs/microservices';
import { KafkaService } from './kafka.service';
import { Inject, OnApplicationBootstrap } from '@nestjs/common';
import { Partitioners } from 'kafkajs';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        imports: [ConfigModule],
        name: 'appNest',
        useFactory: (configService: ConfigService) => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              brokers: [configService.get<string>('kafka.broker') || ''],
            },
            producer: {
              topic: configService.get<string>('kafka.topic'),
              createPartitioner: Partitioners.DefaultPartitioner,
            },
            consumer: {
              groupId: configService.get<string>('kafka.groupId') || '',
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule implements OnApplicationBootstrap {
  constructor(@Inject('appNest') private clientKafka: ClientKafka) {}

  async onApplicationBootstrap() {
    await this.clientKafka.connect();
  }
}
