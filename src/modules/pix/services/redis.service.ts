/* eslint-disable @typescript-eslint/no-unsafe-return */
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

  async addMessagesToStream(
    iterationId: string,
    messages: any[],
  ): Promise<void> {
    const key = `stream:${iterationId}:messages`;
    await this.redisClient.setex(key, 3600, JSON.stringify(messages)); // 1 hora
  }

  async getStreamMessages(iterationId: string): Promise<any[]> {
    const key = `stream:${iterationId}:messages`;
    const messages = await this.redisClient.get(key);
    return messages ? JSON.parse(messages) : [];
  }

  async removeStreamMessages(iterationId: string): Promise<void> {
    await this.redisClient.del(`stream:${iterationId}:messages`);
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
