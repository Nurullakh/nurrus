import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('view_history')
@Index(['userId', 'productId'])
@Index(['userId', 'viewedAt'])
export class ViewHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: string; // Может быть guest ID или user ID

  @Column()
  productId: number;

  @CreateDateColumn()
  viewedAt: Date;
}
