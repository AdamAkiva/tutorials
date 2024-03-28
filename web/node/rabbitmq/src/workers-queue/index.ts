import { setTimeout as setTimeoutAsync } from 'node:timers/promises';

import amqp from 'amqplib';

import { RABBIT_MQ_URL } from '../utils.js';

import { createConsumer } from './consumer.js';
import { createProducer, produceMsg } from './producer.js';

/**********************************************************************************/

export async function workersQueueExample() {
  const queueName = 'workersQueueExample';

  const connection = await amqp.connect(RABBIT_MQ_URL);

  const { producerChannel, cleanup } = await createProducer(
    connection,
    queueName
  );
  await Promise.all([
    createConsumer(connection, queueName),
    createConsumer(connection, queueName),
    createConsumer(connection, queueName)
  ]);

  const produceParams: Omit<Parameters<typeof produceMsg>[number], 'msg'> = {
    channel: producerChannel,
    queueName: queueName
  };
  produceMsg({ ...produceParams, msg: 'Hello.' });
  produceMsg({ ...produceParams, msg: 'Hello...' });
  produceMsg({ ...produceParams, msg: 'Hello.....' });

  await setTimeoutAsync(6_000);
  await cleanup({
    channel: producerChannel,
    connection: connection,
    queueName: queueName
  });
}
