import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
    const messages = await this.getUndeliveredMessages(ispb, 10);

    const iterationId = randomUUID();

    // Armazena apenas os IDs das mensagens no stream
    const messageIds = messages.map((m) => String(m.id));
    await this.redisService.addMessagesToStream(iterationId, messageIds);
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
    const idsInStream = (await this.redisService.getStreamMessages(
      iterationId,
    )) as string[];

    if (!idsInStream || idsInStream.length === 0) {
      return {
        messages: [],
        hasMore: false,
      };
    }

    const candidateIds = idsInStream.slice(0, Math.max(1, batchSize));
    const tailIds = idsInStream.slice(candidateIds.length);

    // Claim atômico: apenas IDs realmente associados a este iterationId seguem para fila
    const claimedIds = await this.redisService.claimMessageIds(
      ispb,
      iterationId,
      candidateIds,
    );

    // IDs não-claimados voltam ao início, preservando ordem
    const unclaimedIds = candidateIds.filter((id) => !claimedIds.includes(id));
    const remainingIds = [...unclaimedIds, ...tailIds];

    // Atualiza o stream com os IDs remanescentes
    await this.redisService.addMessagesToStream(iterationId, remainingIds);

    if (claimedIds.length === 0) {
      return {
        messages: [],
        hasMore: remainingIds.length > 0,
      };
    }

    // Enfileira apenas os IDs claimados
    await this.queueService.processStreamMessages({
      iterationId,
      ispb,
      messageIds: claimedIds,
    });

    // Busca as mensagens completas pelo Postgres para devolver na resposta
    const rows = await this.pixMessageRepository.find({
      where: { id: In(claimedIds) },
      relations: ['receiver', 'payer'],
    });
    const mapById = new Map(rows.map((r) => [String((r as any).id), r]));
    const batch = claimedIds
      .map((id) => mapById.get(String(id)))
      .filter((r) => Boolean(r));

    return {
      messages: batch,
      hasMore: remainingIds.length > 0,
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
