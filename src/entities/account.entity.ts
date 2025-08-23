import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Institution } from './institution.entity';
import { PixMessage } from './pix-message.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'cpf_cnpj', type: 'varchar', length: 14 })
  cpfCnpj: string;

  @Column({ type: 'varchar', length: 8 })
  ispb: string;

  @Column({ type: 'varchar', length: 10 })
  agency: string;

  @Column({ name: 'account_number', type: 'varchar', length: 20 })
  accountNumber: string;

  @Column({ name: 'account_type', type: 'varchar', length: 4 })
  accountType: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Institution, (institution) => institution.accounts, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ispb', referencedColumnName: 'ispb' })
  institution: Institution;

  @OneToMany(() => PixMessage, (pixMessage) => pixMessage.payer)
  sentPixMessages: PixMessage[];

  @OneToMany(() => PixMessage, (pixMessage) => pixMessage.receiver)
  receivedPixMessages: PixMessage[];
}
