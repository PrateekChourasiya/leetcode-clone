const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host : 'redis-14909.c305.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 14909
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

(async () => {
    await redisClient.connect();

    await redisClient.set('foo', 'bar');
    const result = await redisClient.get('foo');
    console.log(result);  // >>> bar
})();

module.exports = redisClient;