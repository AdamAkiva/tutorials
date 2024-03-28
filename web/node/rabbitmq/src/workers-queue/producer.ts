import amqp from 'amqplib';

/**********************************************************************************/

export async function createProducer(
  connection: amqp.Connection,
  queueName: string
) {
  try {
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    return {
      producerChannel: channel,
      cleanup: async function cleanup(params: {
        channel: amqp.Channel;
        connection: amqp.Connection;
        queueName: string;
      }) {
        const { channel, connection, queueName } = params;

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
  queueName: string;
  msg: string;
}) {
  const { channel, queueName, msg } = params;

  channel.sendToQueue(queueName, Buffer.from(msg), { persistent: false });
}
