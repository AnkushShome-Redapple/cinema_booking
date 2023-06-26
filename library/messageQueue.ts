import amqp, { Channel } from 'amqplib';

export async function sendToQueue(message: any) {
    const queue = 'seat-purchase-queue';
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue);
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

    await channel.close();
    await connection.close();
}

export async function consumeFromQueue(queue: string, callback: (msg: any) => void) {
    const connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    await channel.assertQueue(queue);
    channel.consume(queue, callback);

    await channel.close();
    await connection.close();
}