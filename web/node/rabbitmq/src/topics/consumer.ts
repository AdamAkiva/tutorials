import amqp from 'amqplib';

/**********************************************************************************/

export async function createConsumer(params: {
  connection: amqp.Connection;
  exchangeName: string;
  queueName: string;
  routingKeys: Set<string>;
}) {
  try {
    const { connection, exchangeName, queueName, routingKeys } = params;

    const channel = await connection.createChannel();
    await channel.assertExchange(exchangeName, 'topic', { durable: false });
    await channel.assertQueue(queueName);

    routingKeys.forEach((routingKey) => {
      channel.bindQueue(queueName, exchangeName, routingKey);
    });

    await channel.consume(queueName, async (msg) => {
      if (!msg) {
        return;
      }

      console.log(
        `${msg.fields.consumerTag} - ${msg.fields.routingKey}: ${msg.content.toString()}`
      );
      channel.ack(msg);
    });
  } catch (err) {
    console.error(err);

    throw err;
  }
}
