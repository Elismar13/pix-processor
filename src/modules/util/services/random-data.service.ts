import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Account } from '../../../entities/account.entity';
import { Institution } from '../../../entities/institution.entity';
import { PixMessage } from '../../../entities/pix-message.entity';
import { AccountType } from '../../../enums/account-type.enum';

type PixMessageGenerationResult = {
  pixMessage: PixMessage;
  payerAccount: Account;
  receiverAccount: Account;
};

@Injectable()
export class RandomDataService {
  generateInstitution(ispb?: string): Institution {
    const institution = new Institution();
    institution.ispb = ispb || faker.string.numeric(8);
    institution.name = faker.company.name();
    return institution;
  }

  generateAccount(institutionIspb: string): Account {
    const account = new Account();
    account.name = faker.person.fullName();
    account.cpfCnpj = faker.string.numeric(11); // CPF
    account.ispb = institutionIspb;
    account.agency = faker.string.numeric(4);
    account.accountNumber = faker.string.numeric(7);
    account.accountType = faker.helpers.arrayElement(
      Object.values(AccountType),
    ) as AccountType;
    return account;
  }

  generatePixMessage(payer: Account, receiver: Account): PixMessage {
    const now = new Date();

    const pixMessage = new PixMessage();
    pixMessage.endToEndId = `E${faker.string.alphanumeric(31)}`;
    pixMessage.amount = parseFloat(
      faker.finance.amount({ min: 1, max: 10000, dec: 2 }),
    );
    pixMessage.payer = payer;
    pixMessage.receiver = receiver;
    pixMessage.freeField = faker.lorem.sentence();
    pixMessage.txId = faker.string.alphanumeric(18);
    pixMessage.paymentDatetime = now;
    pixMessage.isProcessed = false;
    pixMessage.isDelivered = false;

    return pixMessage;
  }

  generateMultiplePixMessages(
    count: number,
    receiverIspb: string,
  ): PixMessageGenerationResult[] {
    const result: PixMessageGenerationResult[] = [];

    for (let i = 0; i < count; i++) {
      const payerInstitution = this.generateInstitution();
      const payerAccount = this.generateAccount(payerInstitution.ispb);
      payerAccount.institution = payerInstitution;

      const receiverAccount = this.generateAccount(receiverIspb);
      const receiverInstitution = this.generateInstitution(receiverIspb);
      receiverAccount.institution = receiverInstitution;

      const pixMessage = this.generatePixMessage(payerAccount, receiverAccount);

      result.push({
        pixMessage,
        payerAccount,
        receiverAccount,
      });
    }

    return result;
  }
}
