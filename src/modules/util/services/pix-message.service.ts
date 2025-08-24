import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PixMessage } from '../../../entities/pix-message.entity';
import { Account } from '../../../entities/account.entity';
import { Institution } from '../../../entities/institution.entity';
import { CreatePixMessageDto } from '../../../dto/pix-message/request/create-pix-message.dto';

@Injectable()
export class PixMessageService {
  constructor() {}

  async createMultiple(
    ispb: string,
    count: number,
  ): Promise<{ count: number }> {
    return Promise.resolve({ count });
  }
}
