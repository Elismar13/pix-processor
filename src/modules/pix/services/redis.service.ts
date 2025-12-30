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

  // Associa messageIds -> iterationId (por ISPB) de forma atômica.
  // Apenas IDs não reclamados previamente são associados e retornados.
  async claimMessageIds(
    ispb: string,
    iterationId: string,
    messageIds: string[],
  ): Promise<string[]> {
    if (!messageIds.length) return [];
    const ownerKey = `ispb:${ispb}:owners`;
    const pipeline = this.redisClient.pipeline();
    for (const id of messageIds) {
      pipeline.hsetnx(ownerKey, id, iterationId);
    }
    const results = await pipeline.exec();
    const claimed: string[] = [];
    results?.forEach((res, idx) => {
      const [err, reply] = res as [Error | null, number | null];
      if (!err && reply === 1) {
        claimed.push(messageIds[idx] as string);
      }
    });
    return claimed;
  }

  // Libera associação de messageIds previamente reclamados
  async releaseMessageIds(ispb: string, messageIds: string[]): Promise<void> {
    if (!messageIds.length) return;
    const ownerKey = `ispb:${ispb}:owners`;
    await this.redisClient.hdel(ownerKey, ...messageIds);
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
