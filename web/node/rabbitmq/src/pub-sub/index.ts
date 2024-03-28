import { setTimeout as setTimeoutAsync } from 'node:timers/promises';

import amqp from 'amqplib';

import { RABBIT_MQ_URL } from '../utils.js';

import { createPublisher, produceMsg } from './publisher.js';
import { createSubscriber } from './subscriber.js';

/**********************************************************************************/

export async function pubsubExample() {
  const exchangeName = 'pubsubExchangeExample';
  const queueName = 'pubsubQueueExample';

  const connection = await amqp.connect(RABBIT_MQ_URL);

  const { publisherChannel, cleanup } = await createPublisher(
    connection,
    exchangeName
  );

  const subscriberParams: Parameters<typeof createSubscriber>[number] = {
    connection: connection,
    exchangeName: exchangeName,
    queueName: queueName
  };

  await Promise.all([
    createSubscriber(subscriberParams),
    createSubscriber(subscriberParams),
    createSubscriber(subscriberParams),
    createSubscriber(subscriberParams),
    createSubscriber(subscriberParams)
  ]);

  const produceParams: Omit<Parameters<typeof produceMsg>[number], 'msg'> = {
    channel: publisherChannel,
    exchangeName: exchangeName
  };
  ['Hello', 'my', 'name', 'is'].forEach((msg) => {
    produceMsg({ ...produceParams, msg: msg });
  });

  await setTimeoutAsync(2_000);
  await cleanup({
    channel: publisherChannel,
    connection: connection,
    queueName: queueName,
    exchangeName: exchangeName
  });
}
