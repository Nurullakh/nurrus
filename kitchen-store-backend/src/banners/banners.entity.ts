import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('banners')
export class Banner {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  subtitle: string;

  @Column()
  imageUrl: string;

  @Column({ nullable: true })
  link: string;

  @Column({ default: 'all' })
  device: string; // 'desktop' | 'mobile' | 'all'

  @Column({ default: 'main' })
  position: string; // 'main' | 'sidebar' | 'footer'

  @Column({ type: 'int', default: 1 })
  order: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
