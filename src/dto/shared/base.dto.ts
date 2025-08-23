import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export abstract class BaseDto {
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  updatedAt?: Date;
}
