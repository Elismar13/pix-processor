import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PixMessage } from '../../entities/pix-message.entity';
import { Account } from '../../entities/account.entity';
import { Institution } from '../../entities/institution.entity';
import { PixMessageService } from './services/pix-message.service';
import { PixMessageController } from './controllers/pix-message.controller';
import { RandomDataService } from './services/random-data.service';

@Module({
  imports: [TypeOrmModule.forFeature([PixMessage, Account, Institution])],
  controllers: [PixMessageController],
  providers: [PixMessageService, RandomDataService],
  exports: [PixMessageService],
})
export class UtilModule {}
