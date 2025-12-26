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
    // Sempre busca até 10 mensagens por ciclo, conforme especificação
    const messages = await this.getUndeliveredMessages(ispb, 10);

    const iterationId = randomUUID();

    // Por padrão, mantemos todas as mensagens no stream até que o controller
    // decida o tamanho do lote na continuação. Aqui apenas registramos o stream.
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
    batchSize: number = 10,
  ): Promise<{
    messages: any[];
    hasMore: boolean;
  }> {
    const messagesInStream =
      await this.redisService.getStreamMessages(iterationId);

    if (!messagesInStream || messagesInStream.length === 0) {
      return {
        messages: [],
        hasMore: false,
      };
    }

    const batch = messagesInStream.slice(0, Math.max(1, batchSize));
    const remaining = messagesInStream.slice(batch.length);

    // Processa apenas o lote retornado
    await this.queueService.processStreamMessages({
      iterationId,
      ispb,
      messageIds: batch.map((m) => m.id as string),
    });

    // Atualiza o stream com os remanescentes
    await this.redisService.addMessagesToStream(iterationId, remaining);

    return {
      messages: batch,
      hasMore: remaining.length > 0,
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
