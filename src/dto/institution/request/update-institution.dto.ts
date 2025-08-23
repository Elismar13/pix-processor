import { IsString, Length, IsOptional } from 'class-validator';

export class UpdateInstitutionDto {
  @IsString({ message: 'Name must be a string' })
  @Length(1, 50, { message: 'Name must be between 1 and 50 characters' })
  @IsOptional()
  name?: string;
}
