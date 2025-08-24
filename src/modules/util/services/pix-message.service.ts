import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PixMessage } from '../../../entities/pix-message.entity';
import { AccountService } from '../../account/services/account.service';
import { InstitutionService } from '../../institution/services/institution.service';
import { RandomDataService } from './random-data.service';

@Injectable()
export class PixMessageService {
  constructor(
    @InjectRepository(PixMessage)
    private readonly pixMessageRepo: Repository<PixMessage>,
    private readonly accountService: AccountService,
    private readonly institutionService: InstitutionService,
    private readonly randomData: RandomDataService,
  ) {}

  async createMultiple(
    ispb: string,
    count: number,
  ): Promise<{ created: number }> {
    const data = this.randomData.generateMultiplePixMessages(count, ispb);
    const accounts: any[] = [];
    const messages: PixMessage[] = [];

    for (const { pixMessage, payerAccount, receiverAccount } of data) {
      // Payer
      const payerInstitution = await this.institutionService.findOrCreate(
        payerAccount.institution.ispb,
        payerAccount.institution.name,
      );

      const payerAccountEntity = await this.accountService.create(
        payerAccount,
        payerInstitution,
      );

      // Receiver
      const receiverInstitution = await this.institutionService.findOrCreate(
        receiverAccount.institution.ispb,
        receiverAccount.institution.name,
      );

      const receiverAccountEntity = await this.accountService.create(
        receiverAccount,
        receiverInstitution,
      );

      // PixMessage
      const pixMessageEntity = this.pixMessageRepo.create({
        ...pixMessage,
        payer: payerAccountEntity,
        receiver: receiverAccountEntity,
      });

      accounts.push(payerAccountEntity, receiverAccountEntity);
      messages.push(pixMessageEntity);
    }

    // Save all messages in a single transaction
    await this.pixMessageRepo.save(messages);
    return { created: messages.length };
  }
}
