import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { PixMessage } from '../../../entities/pix-message.entity';
import { Account } from '../../../entities/account.entity';
import { Institution } from '../../../entities/institution.entity';
import { RandomDataService } from './random-data.service';

@Injectable()
export class PixMessageService {
  constructor(
    @InjectRepository(PixMessage)
    private readonly pixMessageRepo: Repository<PixMessage>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
    private readonly randomData: RandomDataService,
  ) {}

  private async findOrCreateInstitution(
    manager: EntityManager,
    ispb: string,
    name?: string,
  ): Promise<Institution> {
    let institution = await manager.getRepository(Institution).findOne({
      where: { ispb },
    });

    if (!institution) {
      institution = manager.getRepository(Institution).create({
        ispb,
        name: name || `Institution ${ispb}`,
      });
      institution = await manager.getRepository(Institution).save(institution);
    }

    return institution;
  }

  private async createAccount(
    manager: EntityManager,
    accountData: Partial<Account>,
    institution: Institution,
  ): Promise<Account> {
    const account = manager.getRepository(Account).create({
      ...accountData,
      institution,
    });
    return manager.getRepository(Account).save(account);
  }

  async createMultiple(
    ispb: string,
    count: number,
  ): Promise<{ created: number }> {
    return this.pixMessageRepo.manager.transaction(async (manager) => {
      const data = this.randomData.generateMultiplePixMessages(count, ispb);

      const accounts: Account[] = [];
      const messages: PixMessage[] = [];

      for (const { pixMessage, payerAccount, receiverAccount } of data) {
        // Payer
        const payerInstitutionEntity = await this.findOrCreateInstitution(
          manager,
          payerAccount.institution.ispb,
          payerAccount.institution.name,
        );

        const payerAccountEntity = await this.createAccount(
          manager,
          payerAccount,
          payerInstitutionEntity,
        );

        // Receiver
        const receiverInstitutionEntity = await this.findOrCreateInstitution(
          manager,
          receiverAccount.institution.ispb,
          receiverAccount.institution.name,
        );

        const receiverAccountEntity = await this.createAccount(
          manager,
          receiverAccount,
          receiverInstitutionEntity,
        );

        // PixMessage
        const pixMessageEntity = manager.getRepository(PixMessage).create({
          ...pixMessage,
          payer: payerAccountEntity,
          receiver: receiverAccountEntity,
        });

        accounts.push(payerAccountEntity, receiverAccountEntity);
        messages.push(pixMessageEntity);
      }

      // batch inserts
      await manager.getRepository(Account).save(accounts);
      await manager.getRepository(PixMessage).save(messages);

      return { created: messages.length };
    });
  }
}
