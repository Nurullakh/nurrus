import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Category } from '../categories/categories.entity';

@Entity('products')
@Index(['category'])
@Index(['brand'])
@Index(['is_available'])
@Index(['price'])
@Index(['ownerId'])
@Index(['moderationStatus'])
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'categoryId' })
  categoryRelation: Category;

  @Column({ default: '' })
  category: string; // Оставляем для обратной совместимости

  @Column({ default: '' })
  brand: string;

  @Column('jsonb', { default: {} })
  specifications: Record<string, any>;

  @Column('text', { array: true, default: '{}' })
  images: string[];

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ default: 0 })
  reviews_count: number;

  @Column({ default: true })
  is_available: boolean;

  @Column({ nullable: true })
  article: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'int', nullable: true })
  ownerId: number | null;

  @Column({ default: 'pending' })
  moderationStatus: string; // 'draft' | 'pending' | 'approved' | 'rejected'

  @Column({ type: 'text', nullable: true })
  moderationComment: string | null;

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt: Date | null;

  @Column({ type: 'int', nullable: true })
  moderatedById: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
