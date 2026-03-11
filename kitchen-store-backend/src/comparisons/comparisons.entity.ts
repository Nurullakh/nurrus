import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('comparisons')
@Index(['userId'])
export class Comparison {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string; // Может быть guest ID или user ID

  @Column('simple-array')
  productIds: number[]; // Массив ID товаров для сравнения

  @CreateDateColumn()
  createdAt: Date;
}

