import { IsString, Length, IsOptional } from 'class-validator';

export class CreateInstitutionDto {
  @IsString({ message: 'ISPB must be a string' })
  @Length(8, 8, { message: 'ISPB must be exactly 8 characters' })
  ispb: string;

  @IsString()
  @Length(1, 50)
  @IsOptional()
  name?: string;
}
