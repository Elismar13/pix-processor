import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly redisClient: Redis;

  constructor() {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT as string) || 6379,
    });
  }

  async getActiveStreamCount(ispb: string): Promise<number> {
    const count = await this.redisClient.scard(`ispb:${ispb}:streams`);
    return count || 0;
  }

  async addActiveStream(ispb: string, iterationId: string): Promise<void> {
    await this.redisClient.sadd(`ispb:${ispb}:streams`, iterationId);
  }

  async removeActiveStream(ispb: string, iterationId: string): Promise<void> {
    await this.redisClient.srem(`ispb:${ispb}:streams`, iterationId);
  }

  async cacheMessages(ispb: string, messages: any[]): Promise<void> {
    if (messages.length === 0) return;

    const key = `ispb:${ispb}:cached_messages`;
    await this.redisClient.setex(key, 300, JSON.stringify(messages)); // 5 minutos
  }

  async getCachedMessages(ispb: string): Promise<any[]> {
    const key = `ispb:${ispb}:cached_messages`;
    const cached = await this.redisClient.get(key);
    return cached ? JSON.parse(cached) : [];
  }

  async isHealthy(): Promise<boolean> {
    try {
      await this.redisClient.ping();
      return true;
    } catch {
      return false;
    }
  }
}
