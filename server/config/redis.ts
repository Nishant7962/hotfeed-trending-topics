import Redis from 'ioredis';

let redis: Redis;

function createRedisClient(): Redis {
  const opts = {
    retryStrategy(times: number) {
      const delay = Math.min(times * 100, 30_000);
      return delay;
    },
    lazyConnect: true,
    enableOfflineQueue: false,
    tls: process.env.REDIS_URL?.includes('upstash') ? { rejectUnauthorized: false } : undefined,
  };

  const client = process.env.REDIS_URL
    ? new Redis(process.env.REDIS_URL, opts)
    : new Redis({
        host:     process.env.REDIS_HOST     || 'localhost',
        port:     Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
        ...opts,
      });

  client.on('connect', () => {
    console.log('[Redis] Connected');
  });

  client.on('error', (err: Error) => {
    // Log but never crash — app degrades gracefully
    console.error('[Redis] Connection error:', err.message);
  });

  client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
  });

  return client;
}

redis = createRedisClient();

// Attempt connection (non-blocking)
redis.connect().catch((err: Error) => {
  console.error('[Redis] Failed initial connect:', err.message);
});

export { redis };
export default redis;
