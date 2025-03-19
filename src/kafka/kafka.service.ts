import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { errorsHandler } from '../error/errors.handler';
import kafkaConfig from '../config/kafka.config';
import { ConfigType } from '@nestjs/config';
import { AppConstant } from '../config/constants';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  constructor(
    @Inject(AppConstant.CLIENT_KAFKA_NAME) private readonly clientKafka: ClientKafka,
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
