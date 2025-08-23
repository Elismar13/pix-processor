import {
  IsString,
  IsUUID,
  IsDateString,
  IsNumber,
  IsPositive,
  IsOptional,
  Length,
} from 'class-validator';

export class CreatePixMessageDto {
  @IsString()
  @Length(32, 32)
  endToEndId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsUUID()
  payerId: string;

  @IsUUID()
  receiverId: string;

  @IsString()
  @Length(0, 128)
  @IsOptional()
  freeField?: string;

  @IsString()
  @Length(1, 18)
  txId: string;

  @IsDateString()
  paymentDatetime: Date;
}
