import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PixMessage } from '../../../entities/pix-message.entity';
import { Account } from '../../../entities/account.entity';
import { Institution } from '../../../entities/institution.entity';

@Injectable()
export class PixService {
  constructor(
    @InjectRepository(PixMessage)
    private readonly pixMessageRepository: Repository<PixMessage>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Institution)
    private readonly institutionRepository: Repository<Institution>,
  ) {}

  // Buscar mensagens não entregues para um ISPB
  async getUndeliveredMessages(
    ispb: string,
    limit: number = 10,
  ): Promise<PixMessage[]> {
    return await this.pixMessageRepository
      .createQueryBuilder('message')
      .innerJoinAndSelect('message.receiver', 'receiver')
      .innerJoinAndSelect('message.payer', 'payer')
      .where('message.ispb = :ispb', { ispb })
      .andWhere('message.is_processed = true')
      .andWhere('message.is_delivered = false')
      .orderBy('message.created_at', 'ASC')
      .limit(limit)
      .getMany();
  }

  // Buscar próxima mensagem para um stream específico
  async getNextMessageForStream(
    ispb: string,
    iterationId: string,
  ): Promise<PixMessage | null> {
    const messages = await this.getUndeliveredMessages(ispb, 1);
    return messages.length > 0 ? messages[0] : null;
  }

  // Buscar múltiplas mensagens para um stream
  async getMessagesForStream(
    ispb: string,
    limit: number = 10,
  ): Promise<PixMessage[]> {
    return await this.getUndeliveredMessages(ispb, limit);
  }

  // Marcar mensagens como entregues
  async markMessagesAsDelivered(messageIds: string[]): Promise<void> {
    if (messageIds.length === 0) return;

    await this.pixMessageRepository
      .createQueryBuilder()
      .update(PixMessage)
      .set({ isDelivered: true, updatedAt: new Date() })
      .where('id IN (:...messageIds)', { messageIds })
      .execute();
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
