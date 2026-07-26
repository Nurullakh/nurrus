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
import { Product } from '../products/products.entity';
import { User } from '../users/users.entity';

@Entity('reviews')
@Index(['productId'])
@Index(['userId'])
@Index(['rating'])
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  userId: number;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  userName: string;

  @Column()
  userEmail: string;

  @Column({ type: 'int' })
  rating: number; // 1-5

  @Column('text')
  comment: string;

  @Column('text', { array: true, default: '{}' })
  images: string[]; // Фото от покупателя

  @Column({ default: true })
  isVerified: boolean; // Покупка подтверждена

  @Column({ default: false })
  isModerated: boolean; // Проверено модератором

  @Column({ default: false })
  isPublished: boolean; // Опубликовано

  @Column({ nullable: true })
  adminComment: string; // Ответ администратора

  @Column({ default: 0 })
  helpfulCount: number; // Полезно

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
