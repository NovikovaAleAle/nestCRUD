import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { errorsHandler } from '../error/errors.handler';
import { ClientKafkaName } from '../config/constants';
import kafkaConfig from 'src/config/kafka.config';
import { ConfigType } from '@nestjs/config';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  constructor(
    @Inject(ClientKafkaName) private readonly clientKafka: ClientKafka,
    @Inject(kafkaConfig.KEY)
    private configKafka: ConfigType<typeof kafkaConfig>,
  ) {}

  sendMessage(message: string) {
    const producer = this.clientKafka.producer;
    producer.connect().catch((error) => {
      this.logger.error("The producer couldn't connect");
      throw errorsHandler(error as Error);
    });
    producer
      .send({
        topic: this.configKafka.topic,
        messages: [{ value: message }],
      })
      .catch((error) => {
        this.logger.error('The message has not been sent');
        throw errorsHandler(error as Error);
      });
    this.logger.log('User creation message sent');
  }
}
