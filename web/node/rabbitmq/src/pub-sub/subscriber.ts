import amqp from 'amqplib';

/**********************************************************************************/

export async function createSubscriber(params: {
  connection: amqp.Connection;
  exchangeName: string;
  queueName: string;
}) {
  try {
    const { connection, exchangeName, queueName } = params;

    const channel = await connection.createChannel();

    await channel.assertExchange(exchangeName, 'fanout', {
      durable: false
    });
    await channel.assertQueue(queueName);
    await channel.bindQueue(queueName, exchangeName, '');

    await channel.consume(queueName, async (msg) => {
      if (!msg?.content.length) {
        return;
      }
      console.log(
        `Worker ${msg.fields.consumerTag} - ${msg.content.toString()}`
      );
      channel.ack(msg);
    });
  } catch (err) {
    console.error(err);

    throw err;
  }
}
