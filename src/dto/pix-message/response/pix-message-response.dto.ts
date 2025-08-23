import { BaseDto } from '../../shared/base.dto';

export class PixMessageResponseDto extends BaseDto {
  endToEndId: string;
  amount: number;
  payerId: string;
  receiverId: string;
  freeField?: string;
  txId: string;
  paymentDatetime: Date;
  isProcessed: boolean;
  isDelivered: boolean;
}
