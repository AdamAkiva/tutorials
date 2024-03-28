import amqp from 'amqplib';

/**********************************************************************************/

type RoutingKeys = 'error' | 'log' | 'warn';

/**********************************************************************************/

export async function createConsumer(params: {
  connection: amqp.Connection;
  queueName: string;
  exchangeName: string;
  routingKeys: Set<string>;
}) {
  const { connection, queueName, exchangeName, routingKeys } = params;

  const channel = await connection.createChannel();
  await channel.assertExchange(exchangeName, 'direct', { durable: false });
  await channel.assertQueue(queueName);

  await Promise.all(
    Array.from(routingKeys.values()).map(async (routingKey) => {
      await channel.bindQueue(queueName, exchangeName, routingKey);
    })
  );

  await channel.consume(queueName, async (msg) => {
    if (!msg) {
      return;
    }

    const routingKey = msg.fields.routingKey as RoutingKeys;
    if (routingKeys.has(routingKey)) {
      console[routingKey](
        `[${msg.fields.consumerTag} - ${routingKey.toUpperCase()}] - ${msg.content.toString()}`
      );
    }
    channel.ack(msg);
  });
}
