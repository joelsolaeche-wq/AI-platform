import Redis from 'ioredis';

let instance: Redis | null = null;

export function getRedis(url: string): Redis {
  if (!instance) {
    instance = new Redis(url, { maxRetriesPerRequest: null });
  }
  return instance;
}
