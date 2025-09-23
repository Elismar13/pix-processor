import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('message-processing') private readonly messageQueue: Queue,
  ) {}

  async addMessageProcessJob(messageData: any): Promise<void> {
    await this.messageQueue.add('process-message', messageData, {
      attempts: 3,
      backoff: 1000,
    });
  }

  async addMarkDeliveredJob(data: {
    messageIds: string[];
    ispb: string;
  }): Promise<void> {
    await this.messageQueue.add('mark-delivered', data, {
      attempts: 2,
    });
  }

  async getJobCounts(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
  }> {
    return await this.messageQueue.getJobCounts();
  }
}