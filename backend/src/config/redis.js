const { createClient } = require('redis');

const client = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-14035.c301.ap-south-1-1.ec2.redns.redis-cloud.com',
        port: 14035
    }
});

client.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await client.connect();

    await client.set('foo', 'bar');
    const result = await client.get('foo');
    console.log(result);  // >>> bar
})();
