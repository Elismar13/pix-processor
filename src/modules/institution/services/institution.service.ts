import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Institution } from '../../../entities/institution.entity';

@Injectable()
export class InstitutionService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
  ) {}

  async findOrCreate(ispb: string, name?: string): Promise<Institution> {
    let institution = await this.institutionRepo.findOne({ where: { ispb } });

    if (!institution) {
      institution = this.institutionRepo.create({
        ispb,
        name: name || `Institution ${ispb}`,
      });
      institution = await this.institutionRepo.save(institution);
    }

    return institution;
  }

  async institutionExists(ispb: string): Promise<boolean> {
    const institution = await this.institutionRepo.findOne({ where: { ispb } });
    return !!institution;
  }
}
