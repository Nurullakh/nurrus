import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  orderNumber: string;

  @Column({ type: 'varchar', nullable: true })
  userId: string | null;

  @Column()
  customerName: string;

  @Column()
  customerEmail: string;

  @Column()
  customerPhone: string;

  @Column('text')
  address: string;

  @Column()
  city: string;

  @Column()
  postalCode: string;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @Column('jsonb')
  items: Array<{
    productId: number;
    name: string;
    price: number;
    quantity: number;
    image?: string;
  }>;

  @Column('decimal', { precision: 10, scale: 2 })
  subtotal: number;

  @Column('decimal', { precision: 10, scale: 2 })
  deliveryPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  deliveryMethod: string; // 'standard' | 'express' | 'pickup'

  @Column()
  paymentMethod: string; // 'card' | 'cash' | 'sbp'

  @Column({ default: 'pending' })
  status: string; // 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'

  @Column({ default: 'pending' })
  paymentStatus: string; // 'pending' | 'paid' | 'refunded'

  @Column({ nullable: true })
  trackingNumber: string; // Трекинг номер доставки

  @Column('jsonb', { nullable: true })
  trackingHistory: Array<{
    status: string;
    date: Date;
    location?: string;
    comment?: string;
  }>; // История перемещений заказа

  @Column({ type: 'date', nullable: true })
  estimatedDeliveryDate: Date; // Предполагаемая дата доставки

  @Column({ nullable: true })
  courierName: string; // Имя курьера

  @Column({ nullable: true })
  courierPhone: string; // Телефон курьера

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

