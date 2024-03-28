import amqp from 'amqplib';

/**********************************************************************************/

export async function createProducer(
  connection: amqp.Connection,
  exchangeName: string
) {
  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, 'direct', { durable: false });

  return {
    producerChannel: channel,
    cleanup: async function cleanup(params: {
      connection: amqp.Connection;
      channel: amqp.Channel;
      queueName: string;
      exchangeName: string;
    }) {
      const { connection, channel, queueName, exchangeName } = params;

      await channel.deleteExchange(exchangeName);
      await channel.deleteQueue(queueName);
      await connection.close();
    }
  };
}

export function produceMsg(params: {
  routingKey: string;
  channel: amqp.Channel;
  exchangeName: string;
}) {
  const { routingKey, channel, exchangeName } = params;

  channel.publish(
    exchangeName,
    routingKey,
    Buffer.from(`${routingKey.charAt(0).toUpperCase()}${routingKey.slice(1)}`)
  );
}
