import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { PixController } from './controllers/pix.controller';
import { PixService } from './services/pix.service';
import { RedisService } from './services/redis.service';
import { QueueService } from './services/queue.service';
import { MessageWorker } from './workers/message.worker';
import { PixMessageService } from '../util/services/pix-message.service';
import { AccountService } from '../account/services/account.service';
import { InstitutionService } from '../institution/services/institution.service';
import { RandomDataService } from '../util/services/random-data.service';
import { PixMessage } from '../../entities/pix-message.entity';
import { Account } from '../../entities/account.entity';
import { Institution } from '../../entities/institution.entity';
import { PixMessageController } from '../util/controllers/pix-message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PixMessage, Account, Institution]),
    BullModule.registerQueue({
      name: 'message-processing',
    }),
  ],
  controllers: [PixController, PixMessageController],
  providers: [
    PixService,
    PixMessageService,
    RedisService,
    AccountService,
    InstitutionService,
    RandomDataService,
    QueueService,
    MessageWorker,
  ],
  exports: [RedisService, QueueService],
})
export class PixModule {}
