import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('institutions')
export class Institution {
  @PrimaryColumn({ name: 'ispb', type: 'varchar', length: 8 })
  ispb: string;

  @Column({ name: 'name', type: 'varchar', length: 50, nullable: true })
  name?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @OneToMany(() => Account, (account) => account.institution)
  accounts: Account[];
}
