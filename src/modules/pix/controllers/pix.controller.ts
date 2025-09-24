import {
  Controller,
  Get,
  Param,
  Headers,
  Res,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { randomUUID } from 'crypto';
import { PixService } from '../services/pix.service';
import { RedisService } from '../services/redis.service';
import { QueueService } from '../services/queue.service';
import { InstitutionService } from 'src/modules/institution/services/institution.service';

@Controller('pix')
export class PixController {
  constructor(
    private readonly pixService: PixService,
    private readonly institutionService: InstitutionService,
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  @Get(':ispb/stream/start')
  async startStream(
    @Param('ispb') ispb: string,
    @Headers('accept') acceptHeader: string,
    @Res() response: Response,
  ) {
    // Verificar se a instituição existe
    if (!(await this.institutionService.institutionExists(ispb))) {
      throw new NotFoundException('Institution not found');
    }

    // Verificar limite de streams
    const activeStreams = await this.redisService.getActiveStreamCount(ispb);
    if (activeStreams >= 6) {
      response.status(429).json({ error: 'Too many active streams' });
      return;
    }

    // Registrar stream
    const iterationId = randomUUID();
    await this.redisService.addActiveStream(ispb, iterationId);

    // Buscar mensagens
    const messages = await this.pixService.getMessagesForStream(ispb, 10);

    // Configurar resposta baseada no Accept header
    const isMultipart = acceptHeader === 'multipart/json';
    const responseData = isMultipart ? messages : messages[0] || null;

    // Headers
    response.setHeader('Pull-Next', `/api/pix/${ispb}/stream/${iterationId}`);
    response.setHeader('Content-Type', 'application/json');

    if (messages.length === 0) {
      response.status(204).send();
    } else {
      // Marcar como entregues assincronamente
      await this.queueService.addMarkDeliveredJob({
        messageIds: messages.map((m) => m.id),
        ispb: ispb,
      });

      response.status(200).json(responseData);
    }
  }
}
