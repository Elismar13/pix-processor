import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PixMessage } from '../../entities/pix-message.entity';
import { Account } from '../../entities/account.entity';
import { Institution } from '../../entities/institution.entity';
import { PixMessageService } from './services/pix-message.service';
import { PixMessageController } from './controllers/pix-message.controller';
import { RandomDataService } from './services/random-data.service';
import { AccountService } from '../account/services/account.service';
import { InstitutionService } from '../institution/services/institution.service';

@Module({
  imports: [TypeOrmModule.forFeature([PixMessage, Account, Institution])],
  controllers: [PixMessageController],
  providers: [
    PixMessageService,
    RandomDataService,
    AccountService,
    InstitutionService,
  ],
  exports: [PixMessageService],
})
export class UtilModule {}
