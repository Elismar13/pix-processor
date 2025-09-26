import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PixMessage } from '../../../entities/pix-message.entity';

@Processor('message-processing')
@Injectable()
export class MessageWorker {
  constructor(
    @InjectRepository(PixMessage)
    private readonly messageRepository: Repository<PixMessage>,
  ) {}

  @Process('process-stream-messages')
  async processStreamMessages(
    job: Job<{
      iterationId: string;
      ispb: string;
      messageIds: string[];
    }>,
  ) {
    const { messageIds } = job.data;

    await this.messageRepository
      .createQueryBuilder()
      .update(PixMessage)
      .set({
        isProcessed: true,
        isDelivered: true,
      })
      .where('id IN (:...messageIds)', { messageIds })
      .execute();
  }
}
