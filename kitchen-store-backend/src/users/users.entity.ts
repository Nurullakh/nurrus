import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // В production должен быть хеширован

  @Column({ nullable: true })
  phone: string;

  @Column({ default: 'customer' })
  role: string; // 'admin' | 'manager' | 'customer'

  @Column({ default: 'active' })
  status: string; // 'active' | 'blocked'

  @Column({ nullable: true })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @CreateDateColumn()
  registeredAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
