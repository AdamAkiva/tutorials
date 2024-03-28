import { setTimeout as setTimeoutAsync } from 'node:timers/promises';

import amqp from 'amqplib';

import { RABBIT_MQ_URL } from '../utils.js';

import { createConsumer } from './consumer.js';
import { createProducer, produceMsg } from './producer.js';

/**********************************************************************************/

export async function topicsExample() {
  const queueName = 'topicsQueueName';
  const exchangeName = 'topicsExchangeName';
  const routingKeys = new Set([
    'anonymous.err',
    'anonymous.warn',
    'anonymous.info'
  ]);

  const connection = await amqp.connect(RABBIT_MQ_URL);

  const { producerChannel, cleanup } = await createProducer(
    connection,
    queueName
  );
  await createConsumer({
    connection: connection,
    exchangeName: exchangeName,
    queueName: queueName,
    routingKeys: routingKeys
  });

  const produceParams: Omit<
    Parameters<typeof produceMsg>[number],
    'msg' | 'routingKey'
  > = {
    channel: producerChannel,
    exchangeName: exchangeName
  };
  produceMsg({ ...produceParams, routingKey: 'anonymous.err', msg: 'Hello.' });
  produceMsg({
    ...produceParams,
    routingKey: 'anonymous.warn',
    msg: 'Hello...'
  });
  produceMsg({
    ...produceParams,
    routingKey: 'anonymous.info',
    msg: 'Hello.....'
  });

  await setTimeoutAsync(2_000);
  await cleanup({
    channel: producerChannel,
    connection: connection,
    queueName: queueName,
    exchangeName: exchangeName
  });
}
