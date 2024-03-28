import { setTimeout as setTimeoutAsync } from 'node:timers/promises';

import amqp from 'amqplib';

import { RABBIT_MQ_URL } from '../utils.js';

import { createConsumer } from './consumer.js';
import { createProducer, produceMsg } from './producer.js';

/**********************************************************************************/

export async function routingExample() {
  const exchangeName = 'routingExchangeExample';
  const queueName = 'routingQueueExample';
  const routingKeys = new Set(['error', 'warn', 'log']);

  const connection = await amqp.connect(RABBIT_MQ_URL);

  const { producerChannel, cleanup } = await createProducer(
    connection,
    exchangeName
  );

  const consumerParams: Parameters<typeof createConsumer>[number] = {
    connection: connection,
    queueName: queueName,
    exchangeName: exchangeName,
    routingKeys: routingKeys
  };
  await Promise.all([
    createConsumer(consumerParams),
    createConsumer(consumerParams),
    createConsumer(consumerParams),
    createConsumer(consumerParams),
    createConsumer(consumerParams)
  ]);

  const produceMsgParams: Omit<
    Parameters<typeof produceMsg>[number],
    'routingKey'
  > = {
    channel: producerChannel,
    exchangeName: exchangeName
  };
  routingKeys.forEach((routingKey) => {
    produceMsg({ ...produceMsgParams, routingKey: routingKey });
  });

  await setTimeoutAsync(2_000);
  await cleanup({
    channel: producerChannel,
    connection: connection,
    queueName: queueName,
    exchangeName: exchangeName
  });
}
