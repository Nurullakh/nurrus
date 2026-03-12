import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { DeepPartial } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    const items = (createOrderDto.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image,
    }));

    if (!items.length) {
      throw new BadRequestException('Невозможно создать заказ: корзина пуста');
    }

    const subtotal =
      createOrderDto.subtotal ??
      items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryPrice = createOrderDto.deliveryPrice ?? 0;
    const total = createOrderDto.total ?? subtotal + deliveryPrice;

    const orderData: DeepPartial<Order> = {
      userId: createOrderDto.userId ?? null,
      customerName: createOrderDto.customerName,
      customerEmail: createOrderDto.customerEmail,
      customerPhone: createOrderDto.customerPhone,
      address: createOrderDto.address,
      city: createOrderDto.city,
      postalCode: createOrderDto.postalCode,
      comment: createOrderDto.comment,
      items,
      subtotal,
      deliveryPrice,
      total,
      deliveryMethod: createOrderDto.deliveryMethod,
      paymentMethod: createOrderDto.paymentMethod,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending',
    };

    const order = this.ordersRepository.create(orderData);

    return await this.ordersRepository.save(order);
  }

  async findAll(userId?: string): Promise<Order[]> {
    if (userId) {
      return await this.ordersRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });
    }

    return await this.ordersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order | null> {
    return await this.ordersRepository.findOne({ where: { id } });
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    return await this.ordersRepository.findOne({ where: { orderNumber } });
  }

  async addTrackingUpdate(
    id: number,
    status: string,
    location?: string,
    comment?: string,
  ): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    const trackingHistory = order.trackingHistory || [];
    trackingHistory.push({
      status,
      date: new Date(),
      location,
      comment,
    });

    await this.ordersRepository.update(id, {
      trackingHistory,
      status,
    });

    const updatedOrder = await this.findOne(id);
    if (!updatedOrder) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }
    return updatedOrder;
  }

  async updateTrackingNumber(
    id: number,
    trackingNumber: string,
  ): Promise<Order> {
    await this.ordersRepository.update(id, { trackingNumber });
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }
    return order;
  }

  async updateStatus(
    id: number,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    await this.ordersRepository.update(id, updateStatusDto);
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }
    return order;
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `#${timestamp}${random}`;
  }

  // Статистика для админки
  async getStatistics() {
    const totalOrders = await this.ordersRepository.count();
    const pendingOrders = await this.ordersRepository.count({
      where: { status: 'pending' },
    });
    const completedOrders = await this.ordersRepository.count({
      where: { status: 'completed' },
    });

    const result = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'totalRevenue')
      .where('order.paymentStatus = :status', { status: 'paid' })
      .getRawOne<{ totalRevenue: string | null }>();

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: parseFloat(result?.totalRevenue ?? '0') || 0,
    };
  }
}
