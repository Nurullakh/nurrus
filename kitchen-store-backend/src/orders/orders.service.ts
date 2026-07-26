import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, In, Repository } from 'typeorm';
import { Order } from './orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { Product } from '../products/products.entity';
import { User } from '../users/users.entity';
// import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    // private telegramService: TelegramService,
  ) {}

  private isAdmin(user: Pick<User, 'role'>): boolean {
    return user.role === 'admin';
  }

  private getSellerScopedItems(order: Order, sellerId: number) {
    return (order.items || []).filter((item) => item.ownerId === sellerId);
  }

  private hasSellerItems(order: Order, sellerId: number): boolean {
    return this.getSellerScopedItems(order, sellerId).length > 0;
  }

  private getItemsTotal(items: Array<{ price: number; quantity: number }>): number {
    return items.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0,
    );
  }

  private scopeOrderForSeller(order: Order, sellerId: number) {
    const scopedItems = this.getSellerScopedItems(order, sellerId);
    const sellerTotal = this.getItemsTotal(scopedItems);

    return {
      ...order,
      items: scopedItems,
      sellerTotal,
    };
  }

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const orderNumber = this.generateOrderNumber();

    const baseItems = (createOrderDto.items || []).map((item) => ({
      productId: item.productId,
      name: item.name,
      price: Number(item.price) || 0,
      quantity: Number(item.quantity) || 1,
      image: item.image,
    }));

    if (!baseItems.length) {
      throw new BadRequestException('Невозможно создать заказ: корзина пуста');
    }

    const productIds = [...new Set(baseItems.map((item) => item.productId))];
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
      select: ['id', 'ownerId'],
    });
    const productOwnerMap = new Map(
      products.map((product) => [product.id, product.ownerId ?? null]),
    );

    const items = baseItems.map((item) => ({
      ...item,
      ownerId: productOwnerMap.get(item.productId) ?? null,
      ownerNameSnapshot: null,
      ownerRoleSnapshot: null,
    }));

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
    const saved = await this.ordersRepository.save(order);

    // const itemLines = items
    //   .map((i) => `  • ${i.name} × ${i.quantity} — ${i.price * i.quantity} ₽`)
    //   .join('\n');

    // await this.telegramService.sendMessage(
    //   `🛒 <b>Новый заказ ${saved.orderNumber}</b>\n\n` +
    //     `👤 ${saved.customerName}\n` +
    //     `📞 ${saved.customerPhone || '—'}\n` +
    //     `📧 ${saved.customerEmail || '—'}\n` +
    //     `📍 ${[saved.city, saved.address, saved.postalCode].filter(Boolean).join(', ')}\n\n` +
    //     `<b>Товары:</b>\n${itemLines}\n\n` +
    //     `💰 <b>Итого: ${saved.total} ₽</b>\n` +
    //     `🚚 Доставка: ${saved.deliveryMethod || '—'}\n` +
    //     `💳 Оплата: ${saved.paymentMethod || '—'}` +
    //     (saved.comment ? `\n💬 Комментарий: ${saved.comment}` : ''),
    // );

    return saved;
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

  async findAdminPaginated(
    user: Pick<User, 'id' | 'role'>,
    page: number = 1,
    limit: number = 20,
    search?: string,
    status?: string,
    paymentStatus?: string,
  ) {
    const builder = this.ordersRepository
      .createQueryBuilder('order')
      .orderBy('"order"."createdAt"', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (!this.isAdmin(user)) {
      builder.andWhere(
        `EXISTS (
          SELECT 1
          FROM jsonb_array_elements("order"."items") AS item
          WHERE NULLIF(item->>'ownerId', '')::int = :sellerId
        )`,
        { sellerId: user.id },
      );
    }

    if (search?.trim()) {
      builder.andWhere(
        '(LOWER("order"."orderNumber") LIKE LOWER(:search) OR LOWER("order"."customerName") LIKE LOWER(:search) OR LOWER("order"."customerEmail") LIKE LOWER(:search) OR LOWER("order"."customerPhone") LIKE LOWER(:search))',
        { search: `%${search.trim()}%` },
      );
    }

    if (status) {
      builder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      builder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    const [orders, total] = await builder.getManyAndCount();

    const data = this.isAdmin(user)
      ? orders
      : orders.map((order) => this.scopeOrderForSeller(order, user.id));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAdminOrderById(user: Pick<User, 'id' | 'role'>, id: number) {
    const order = await this.findOne(id);

    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    if (this.isAdmin(user)) {
      return order;
    }

    if (!this.hasSellerItems(order, user.id)) {
      throw new ForbiddenException('У вас нет доступа к этому заказу');
    }

    return this.scopeOrderForSeller(order, user.id);
  }

  async updateStatusForAdmin(
    user: Pick<User, 'id' | 'role'>,
    id: number,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }

    if (!this.isAdmin(user) && !this.hasSellerItems(order, user.id)) {
      throw new ForbiddenException('Вы можете менять статус только своих заказов');
    }

    await this.ordersRepository.update(id, updateStatusDto);
    const updatedOrder = await this.findOne(id);
    if (!updatedOrder) {
      throw new NotFoundException(`Заказ с ID ${id} не найден`);
    }
    return updatedOrder;
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
  async getStatistics(user?: Pick<User, 'id' | 'role'>) {
    if (!user || this.isAdmin(user)) {
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

    const sellerOrders = await this.ordersRepository
      .createQueryBuilder('order')
      .where(
        `EXISTS (
          SELECT 1
          FROM jsonb_array_elements("order"."items") AS item
          WHERE NULLIF(item->>'ownerId', '')::int = :sellerId
        )`,
        { sellerId: user.id },
      )
      .orderBy('"order"."createdAt"', 'DESC')
      .getMany();

    const scopedOrders = sellerOrders.map((order) =>
      this.scopeOrderForSeller(order, user.id),
    );

    const totalOrders = scopedOrders.length;
    const pendingOrders = scopedOrders.filter(
      (order) => order.status === 'pending',
    ).length;
    const completedOrders = scopedOrders.filter(
      (order) => order.status === 'completed',
    ).length;
    const totalRevenue = scopedOrders.reduce((acc, order) => {
      if (order.paymentStatus !== 'paid') {
        return acc;
      }
      return acc + order.sellerTotal;
    }, 0);

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    };
  }
}
