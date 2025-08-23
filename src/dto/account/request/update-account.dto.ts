import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateAccountDto {
  @IsString()
  @Length(1, 255)
  @IsOptional()
  name?: string;

  @IsString()
  @Length(1, 10)
  @IsOptional()
  agency?: string;
}
