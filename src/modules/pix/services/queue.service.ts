import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';

@Injectable()
export class QueueService {
  constructor(
    @InjectQueue('message-processing') private readonly messageQueue: Queue,
  ) {}

  async processStreamMessages(data: {
    iterationId: string;
    ispb: string;
    messageIds: string[];
  }): Promise<void> {
    await this.messageQueue.add('process-stream-messages', data, {
      attempts: 3,
      backoff: 1000,
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
