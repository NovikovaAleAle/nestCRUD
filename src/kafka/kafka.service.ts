import { Injectable, Inject, Logger } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { errorsHandler } from '../error/errors.handler';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  constructor(@Inject('appNest') private readonly clientKafka: ClientKafka) {}

  sendMessage(message: string) {
    const producer = this.clientKafka.producer;
    producer.connect().catch((error) => {
      this.logger.error("The producer couldn't connect");
      throw errorsHandler(error as Error);
    });
    producer
      .send({ topic: 'test-topic', messages: [{ value: message }] })
      .catch((error) => {
        this.logger.error('The message has not been sent');
        throw errorsHandler(error as Error);
      });
    this.logger.log('User creation message sent');
    producer.disconnect().catch((error) => {
      this.logger.error("The producer couldn't disconnect");
      throw errorsHandler(error as Error);
    });
  }
}
