import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: string; // 'percent' | 'fixed' | '3for2'

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  value: number; // Процент или сумма скидки

  @Column({ nullable: true })
  category: string;

  @Column({ nullable: true })
  code: string; // Промокод

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ default: 'active' })
  status: string; // 'active' | 'paused' | 'ended'

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
