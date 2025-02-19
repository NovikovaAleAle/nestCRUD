import { Kafka, Partitioners } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'appNest',
  brokers: ['127.0.0.1:9092'],
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export const consumer = kafka.consumer({ groupId: 'test-group' });
