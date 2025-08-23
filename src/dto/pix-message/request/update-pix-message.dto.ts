import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePixMessageDto {
  @IsBoolean()
  @IsOptional()
  isProcessed?: boolean;

  @IsBoolean()
  @IsOptional()
  isDelivered?: boolean;
}
