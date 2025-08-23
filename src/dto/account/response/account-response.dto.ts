import { IsUUID } from 'class-validator';
import { BaseDto } from '../../shared/base.dto';

export class AccountResponseDto extends BaseDto {
  @IsUUID()
  id: string;

  name: string;
  cpfCnpj: string;
  ispb: string;
  agency: string;
  accountNumber: string;
  accountType: string;
}
