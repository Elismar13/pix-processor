import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Account } from './account.entity';

@Entity('pix_messages')
export class PixMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'ispb', type: 'varchar', length: 8 })
  ispb: string;

  @Column({ name: 'end_to_end_id', type: 'varchar', length: 32, unique: true })
  endToEndId: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ name: 'payer_id', type: 'uuid' })
  payerId: string;

  @Column({ name: 'receiver_id', type: 'uuid' })
  receiverId: string;

  @Column({ name: 'free_field', type: 'varchar', length: 128, default: '' })
  freeField: string;

  @Column({ name: 'tx_id', type: 'varchar', length: 18 })
  txId: string;

  @Column({ name: 'payment_datetime', type: 'timestamp with time zone' })
  paymentDatetime: Date;

  @Column({ name: 'is_processed', type: 'boolean', default: false })
  isProcessed: boolean;

  @Column({ name: 'is_delivered', type: 'boolean', default: false })
  isDelivered: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;

  @ManyToOne(() => Account, (account) => account.sentPixMessages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'payer_id' })
  payer: Account;

  @ManyToOne(() => Account, (account) => account.receivedPixMessages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver: Account;
}
