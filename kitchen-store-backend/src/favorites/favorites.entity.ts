import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('favorite_items')
export class FavoriteItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  image: string;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  article: string;

  @Column({ default: true })
  available: boolean;

  @Column({ default: 'guest' })
  userId: string; // Для простоты используем строку

  @CreateDateColumn()
  createdAt: Date;
}

