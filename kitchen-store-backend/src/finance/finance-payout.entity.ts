import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('finance_payouts')
@Index(['sellerId'])
@Index(['status'])
export class FinancePayout {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  sellerId: number;

  @Column('decimal', { precision: 10, scale: 2 })
  grossAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  commissionAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  netAmount: number;

  @Column({ default: 'requested' })
  status: string; // 'requested' | 'approved' | 'paid' | 'rejected'

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @Column({ type: 'int', nullable: true })
  processedById: number | null;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
