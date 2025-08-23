import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AccountType } from '../../../enums/account-type.enum';

export class AccountDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  cpfCnpj: string;

  @IsString()
  @IsNotEmpty()
  ispb: string;

  @IsString()
  @IsNotEmpty()
  agencia: string;

  @IsString()
  @IsNotEmpty()
  contaTransacional: string;

  @IsEnum(AccountType)
  @IsNotEmpty()
  tipoConta: AccountType;
}

export class CreatePixMessageDto {
  @IsString()
  @IsNotEmpty()
  endToEndId: string;

  @IsNumber()
  @IsNotEmpty()
  valor: number;

  @ValidateNested()
  @Type(() => AccountDto)
  @IsNotEmpty()
  pagador: AccountDto;

  @ValidateNested()
  @Type(() => AccountDto)
  @IsNotEmpty()
  recebedor: AccountDto;

  @IsString()
  campoLivre: string;

  @IsString()
  @IsNotEmpty()
  txId: string;

  @IsDateString()
  @IsNotEmpty()
  dataHoraPagamento: string;
}
