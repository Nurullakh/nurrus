import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../users/users.entity';

@Entity('addresses')
@Index(['userId'])
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string; // "Дом", "Офис", "Дача" и т.д.

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column()
  house: string;

  @Column({ nullable: true })
  apartment: string;

  @Column()
  postalCode: string;

  @Column({ nullable: true })
  entrance: string;

  @Column({ nullable: true })
  floor: string;

  @Column({ nullable: true })
  intercom: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column({ default: false })
  isDefault: boolean; // Адрес по умолчанию

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

