import amqp from 'amqplib';

/**********************************************************************************/

export async function createConsumer(
  connection: amqp.Connection,
  queueName: string
) {
  try {
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: false });

    await channel.prefetch(1);
    await channel.consume(queueName, (msg) => {
      if (!msg) {
        return;
      }

      const secs = msg.content.toString().split('.').length - 1;
      console.log(
        `${msg.fields.consumerTag} - Received ${msg.content.toString()}`
      );
      setTimeout(async function () {
        console.log(`${msg.fields.consumerTag} - Done`);
        channel.ack(msg);
      }, secs * 1000);
    });
  } catch (err) {
    console.error(err);

    throw err;
  }
}
