import Redis from 'ioredis';
import { ICachePort } from '../../application/ports/ICachePort';

export class RedisCacheAdapter implements ICachePort {
  constructor(private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const raw = await this.redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  }

  async set<T>(key: string, value: T, ttlSec?: number): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSec && ttlSec > 0) {
      await this.redis.set(key, payload, 'EX', ttlSec);
    } else {
      await this.redis.set(key, payload);
    }
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
}
