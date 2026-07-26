import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from '../orders/orders.entity';
import { FinancePayout } from './finance-payout.entity';
import { User } from '../users/users.entity';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { UpdatePayoutStatusDto } from './dto/update-payout-status.dto';

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(FinancePayout)
    private payoutsRepository: Repository<FinancePayout>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  private getCommissionRate() {
    const parsed = Number(process.env.SELLER_COMMISSION_RATE ?? 0.1);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 1) {
      return 0.1;
    }
    return parsed;
  }

  private isAdmin(user: Pick<User, 'role'>): boolean {
    return user.role === 'admin';
  }

  private getOrderItemsTotalForSeller(order: Order, sellerId: number) {
    return (order.items || [])
      .filter((item) => item.ownerId === sellerId)
      .reduce(
        (sum, item) =>
          sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
        0,
      );
  }

  private async getSellerOrders(sellerId: number) {
    return this.ordersRepository
      .createQueryBuilder('order')
      .where(
        `EXISTS (
          SELECT 1
          FROM jsonb_array_elements("order"."items") AS item
          WHERE NULLIF(item->>'ownerId', '')::int = :sellerId
        )`,
        { sellerId },
      )
      .orderBy('"order"."createdAt"', 'DESC')
      .getMany();
  }

  private async calculateSellerFinance(sellerId: number) {
    const commissionRate = this.getCommissionRate();
    const orders = await this.getSellerOrders(sellerId);

    const grossRevenue = orders.reduce((acc, order) => {
      if (order.paymentStatus !== 'paid') {
        return acc;
      }
      return acc + this.getOrderItemsTotalForSeller(order, sellerId);
    }, 0);

    const commissionAmount = grossRevenue * commissionRate;
    const netRevenue = grossRevenue - commissionAmount;

    const [paidOutRaw, pendingRaw] = await Promise.all([
      this.payoutsRepository
        .createQueryBuilder('payout')
        .select('COALESCE(SUM(payout.netAmount), 0)', 'total')
        .where('payout.sellerId = :sellerId', { sellerId })
        .andWhere('payout.status IN (:...statuses)', {
          statuses: ['approved', 'paid'],
        })
        .getRawOne<{ total: string }>(),
      this.payoutsRepository
        .createQueryBuilder('payout')
        .select('COALESCE(SUM(payout.netAmount), 0)', 'total')
        .where('payout.sellerId = :sellerId', { sellerId })
        .andWhere('payout.status = :status', { status: 'requested' })
        .getRawOne<{ total: string }>(),
    ]);

    const paidOut = Number(paidOutRaw?.total ?? 0);
    const pendingPayouts = Number(pendingRaw?.total ?? 0);
    const availableBalance = Math.max(netRevenue - paidOut - pendingPayouts, 0);

    return {
      grossRevenue,
      commissionAmount,
      netRevenue,
      paidOut,
      pendingPayouts,
      availableBalance,
      ordersCount: orders.length,
    };
  }

  async getSummary(user: Pick<User, 'id' | 'role'>) {
    const commissionRate = this.getCommissionRate();
    if (!this.isAdmin(user)) {
      const sellerSummary = await this.calculateSellerFinance(user.id);
      return {
        commissionRate,
        ...sellerSummary,
      };
    }

    const sellers = await this.usersRepository.find({
      where: { role: 'seller' },
      select: ['id', 'name', 'email', 'status'],
      order: { id: 'ASC' },
    });

    const sellersSummary = await Promise.all(
      sellers.map(async (seller) => ({
        sellerId: seller.id,
        sellerName: seller.name,
        sellerEmail: seller.email,
        sellerStatus: seller.status,
        ...(await this.calculateSellerFinance(seller.id)),
      })),
    );

    return {
      commissionRate,
      sellers: sellersSummary,
      totalGrossRevenue: sellersSummary.reduce(
        (sum, seller) => sum + seller.grossRevenue,
        0,
      ),
      totalCommissionAmount: sellersSummary.reduce(
        (sum, seller) => sum + seller.commissionAmount,
        0,
      ),
      totalNetRevenue: sellersSummary.reduce(
        (sum, seller) => sum + seller.netRevenue,
        0,
      ),
      totalPaidOut: sellersSummary.reduce((sum, seller) => sum + seller.paidOut, 0),
      totalPendingPayouts: sellersSummary.reduce(
        (sum, seller) => sum + seller.pendingPayouts,
        0,
      ),
      totalAvailableBalance: sellersSummary.reduce(
        (sum, seller) => sum + seller.availableBalance,
        0,
      ),
    };
  }

  async getPayouts(
    user: Pick<User, 'id' | 'role'>,
    page: number = 1,
    limit: number = 20,
    status?: string,
    sellerId?: number,
  ) {
    const builder = this.payoutsRepository
      .createQueryBuilder('payout')
      .orderBy('payout.createdAt', 'DESC')
      .take(limit)
      .skip((page - 1) * limit);

    if (this.isAdmin(user)) {
      if (sellerId) {
        builder.where('payout.sellerId = :sellerId', { sellerId });
      }
    } else {
      builder.where('payout.sellerId = :sellerId', { sellerId: user.id });
    }

    if (status) {
      builder.andWhere('payout.status = :status', { status });
    }

    const [payouts, total] = await builder.getManyAndCount();
    const sellerIds = [...new Set(payouts.map((payout) => payout.sellerId))];
    const sellers = sellerIds.length
      ? await this.usersRepository.find({
          where: { id: In(sellerIds) },
          select: ['id', 'name', 'email'],
        })
      : [];
    const sellersMap = new Map(sellers.map((seller) => [seller.id, seller]));

    const data = payouts.map((payout) => ({
      ...payout,
      seller: sellersMap.get(payout.sellerId) || null,
    }));

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async requestPayout(
    user: Pick<User, 'id' | 'role'>,
    requestPayoutDto: RequestPayoutDto,
  ) {
    if (this.isAdmin(user)) {
      throw new ForbiddenException('Запрос выплаты доступен только продавцу');
    }

    const commissionRate = this.getCommissionRate();
    const summary = await this.calculateSellerFinance(user.id);
    const amount = Number(requestPayoutDto.amount ?? summary.availableBalance);

    if (!amount || amount <= 0) {
      throw new BadRequestException('Сумма выплаты должна быть больше 0');
    }

    if (amount > summary.availableBalance) {
      throw new BadRequestException('Недостаточно средств для выплаты');
    }

    const grossAmount = amount / (1 - commissionRate);
    const commissionAmount = grossAmount - amount;

    const payout = this.payoutsRepository.create({
      sellerId: user.id,
      grossAmount,
      commissionAmount,
      netAmount: amount,
      status: 'requested',
      comment: requestPayoutDto.comment ?? null,
      processedById: null,
      processedAt: null,
    });

    return this.payoutsRepository.save(payout);
  }

  async updatePayoutStatus(
    user: Pick<User, 'id' | 'role'>,
    payoutId: number,
    updatePayoutStatusDto: UpdatePayoutStatusDto,
  ) {
    if (!this.isAdmin(user)) {
      throw new ForbiddenException('Изменять статус выплаты может только админ');
    }

    const payout = await this.payoutsRepository.findOne({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new NotFoundException('Выплата не найдена');
    }

    payout.status = updatePayoutStatusDto.status;
    payout.comment = updatePayoutStatusDto.comment ?? payout.comment;
    payout.processedById = user.id;
    payout.processedAt = new Date();

    return this.payoutsRepository.save(payout);
  }
}
