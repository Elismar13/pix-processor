import { IsString, Length, IsIn } from 'class-validator';
import { AccountType } from '../../../enums/account-type.enum';

const accountTypes = Object.values(AccountType);

export class CreateAccountDto {
  @IsString()
  @Length(1, 255)
  name: string;

  @IsString()
  @Length(11, 14) // CPF has 11 digits, CNPJ has 14
  cpfCnpj: string;

  @IsString()
  @Length(8, 8)
  ispb: string;

  @IsString()
  @Length(1, 10)
  agency: string;

  @IsString()
  @Length(1, 20)
  accountNumber: string;

  @IsString()
  @IsIn(accountTypes)
  accountType: AccountType;
}
