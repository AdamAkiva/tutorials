import amqp from 'amqplib';

/**********************************************************************************/

export async function createPublisher(
  connection: amqp.Connection,
  exchangeName: string
) {
  try {
    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'fanout', {
      durable: false
    });

    return {
      publisherChannel: channel,
      cleanup: async function cleanup(params: {
        channel: amqp.Channel;
        connection: amqp.Connection;
        queueName: string;
        exchangeName: string;
      }) {
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
  msg: string;
}) {
  const { channel, exchangeName, msg } = params;

  channel.publish(exchangeName, '', Buffer.from(msg));
}
