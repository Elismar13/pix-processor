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

  @Process('process-message')
  async processMessage(job: Job<any>) {
    const message = job.data;

    await this.messageRepository.save({
      ...message,
      is_processed: true,
    });
  }

  @Process('mark-delivered')
  async markMessagesDelivered(
    job: Job<{ messageIds: string[]; ispb: string }>,
  ) {
    const { messageIds } = job.data;

    await this.messageRepository
      .createQueryBuilder()
      .update(PixMessage)
      .set({ isDelivered: true })
      .where('id IN (:...messageIds)', { messageIds })
      .execute();
  }
}
