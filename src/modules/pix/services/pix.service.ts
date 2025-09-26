import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PixMessage } from '../../../entities/pix-message.entity';
import { RedisService } from './redis.service';
import { QueueService } from './queue.service';
import { randomUUID } from 'node:crypto';

@Injectable()
export class PixService {
  constructor(
    @InjectRepository(PixMessage)
    private readonly pixMessageRepository: Repository<PixMessage>,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  private async getUndeliveredMessages(
    ispb: string,
    limit: number = 10,
  ): Promise<PixMessage[]> {
    return await this.pixMessageRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.receiver', 'receiver')
      .innerJoinAndSelect('message.payer', 'payer')
      .where('message.ispb = :ispb', { ispb })
      // .andWhere('message.is_processed = true')
      .andWhere('message.is_delivered = false')
      .orderBy('message.created_at', 'ASC')
      .limit(limit)
      .getMany();
  }

  async startStream(ispb: string): Promise<{
    messages: any[];
    iterationId: string;
  }> {
    const messages = await this.getUndeliveredMessages(ispb);

    const iterationId = randomUUID();

    await this.redisService.addMessagesToStream(iterationId, messages);

    await this.redisService.addActiveStream(ispb, iterationId);

    return {
      messages,
      iterationId,
    };
  }

  async continueStream(
    ispb: string,
    iterationId: string,
  ): Promise<{
    messages: any[];
    hasMore: boolean;
  }> {
    const messages = await this.redisService.getStreamMessages(ispb);

    const hasMore = messages.length > 0;

    if (hasMore) {
      await this.queueService.processStreamMessages({
        iterationId,
        ispb,
        messageIds: messages.map((m) => m.id as string),
      });

      const remaningMessages = messages.slice(messages.length);

      await this.redisService.addMessagesToStream(
        iterationId,
        remaningMessages,
      );
    }

    return {
      messages,
      hasMore,
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pixMessageRepository.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}
