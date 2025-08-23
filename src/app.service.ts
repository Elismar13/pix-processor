import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import * as Bull from 'bull';
import { QueueEvents } from 'bullmq';

@Processor('example-queue')
@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private queueEvents: QueueEvents;

  constructor(
    private configService: ConfigService,
    @InjectQueue('example-queue') private readonly exampleQueue: Bull.Queue,
  ) {}

  async onModuleInit() {
    console.log('AppService inicializado');

    // Configuração dos eventos da fila
    this.queueEvents = new QueueEvents('example-queue');

    // Eventos de exemplo
    this.queueEvents.on('completed', ({ jobId, returnvalue }) => {
      console.log(`Job ${jobId} completado com sucesso!`, returnvalue);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`Falha no job ${jobId}:`, failedReason);
    });
  }

  async onModuleDestroy() {
    await this.exampleQueue.close();
    await this.queueEvents.close();
  }

  @Process('process-message')
  async processMessage(job: Job<{ message: string }>) {
    console.log(`Processando job ${job.id} com dados:`, job.data);

    // Simula processamento
    await new Promise((resolve) => setTimeout(resolve, 20000));

    return { result: `Processado: ${job.data.message}` };
  }

  async addJob(data: { message: string }) {
    const job = await this.exampleQueue.add('process-message', data, {
      removeOnComplete: true,
      removeOnFail: 100,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    });
    return { jobId: job.id };
  }

  async getJobStatus(jobId: string) {
    const job = await this.exampleQueue.getJob(jobId);
    if (!job) {
      return { status: 'not_found' };
    }
    const state = await job.getState();
    return { status: state };
  }

  getHello(): string {
    return 'Hello World! A fila está funcionando!';
  }
}
