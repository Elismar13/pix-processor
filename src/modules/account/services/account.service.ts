import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../../../entities/account.entity';
import { Institution } from '../../../entities/institution.entity';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async create(
    accountData: Partial<Account>,
    institution: Institution,
  ): Promise<Account> {
    const account = this.accountRepo.create({
      ...accountData,
      institution,
    });
    return this.accountRepo.save(account);
  }

  async createMultiple(accounts: Account[]): Promise<Account[]> {
    return this.accountRepo.save(accounts);
  }
}
