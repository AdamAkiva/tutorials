import amqp from 'amqplib';

/**********************************************************************************/

export async function createProducer(
  connection: amqp.Connection,
  exchangeName: string
) {
  try {
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'topic', { durable: false });

    return {
      producerChannel: channel,
      cleanup: async (params: {
        channel: amqp.Channel;
        connection: amqp.Connection;
        queueName: string;
        exchangeName: string;
      }) => {
        const { channel, connection, queueName, exchangeName } = params;

        await channel.deleteExchange(exchangeName);
        await channel.deleteQueue(queueName);
        await connection.close();
      }
    };
  } catch (err) {
    console.error(err);

    throw err;
  }
}

export function produceMsg(params: {
  channel: amqp.Channel;
  exchangeName: string;
  routingKey: string;
  msg: string;
}) {
  const { channel, exchangeName, routingKey, msg } = params;

  channel.publish(exchangeName, routingKey, Buffer.from(msg));
}
