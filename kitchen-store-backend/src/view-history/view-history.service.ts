import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { ViewHistory } from './view-history.entity';
import { Product } from '../products/products.entity';

@Injectable()
export class ViewHistoryService {
  constructor(
    @InjectRepository(ViewHistory)
    private viewHistoryRepository: Repository<ViewHistory>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  private readonly MAX_HISTORY_ITEMS = 20; // Максимум товаров в истории
  private readonly HISTORY_EXPIRY_DAYS = 30; // История хранится 30 дней

  async addView(userId: string, productId: number): Promise<void> {
    // Проверяем существование товара
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      return;
    }

    // Удаляем старую запись, если есть
    await this.viewHistoryRepository.delete({
      userId,
      productId,
    });

    // Создаем новую запись
    const viewHistory = this.viewHistoryRepository.create({
      userId,
      productId,
    });

    await this.viewHistoryRepository.save(viewHistory);

    // Очищаем старые записи (старше 30 дней)
    await this.cleanOldHistory();

    // Ограничиваем количество записей
    await this.limitHistory(userId);
  }

  async getHistory(userId: string, limit: number = 10): Promise<Product[]> {
    const history = await this.viewHistoryRepository.find({
      where: { userId },
      order: { viewedAt: 'DESC' },
      take: limit,
    });

    if (history.length === 0) {
      return [];
    }

    const productIds = history.map((h) => h.productId);
    const products = await this.productsRepository.find({
      where: productIds.map((id) => ({ id })),
      relations: ['categoryRelation'],
    });

    // Сохраняем порядок из истории
    return productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p) => p !== undefined) as Product[];
  }

  async clearHistory(userId: string): Promise<void> {
    await this.viewHistoryRepository.delete({ userId });
  }

  private async cleanOldHistory(): Promise<void> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - this.HISTORY_EXPIRY_DAYS);

    await this.viewHistoryRepository.delete({
      viewedAt: LessThan(expiryDate),
    });
  }

  private async limitHistory(userId: string): Promise<void> {
    const count = await this.viewHistoryRepository.count({
      where: { userId },
    });

    if (count > this.MAX_HISTORY_ITEMS) {
      const toDelete = await this.viewHistoryRepository.find({
        where: { userId },
        order: { viewedAt: 'ASC' },
        take: count - this.MAX_HISTORY_ITEMS,
      });

      await this.viewHistoryRepository.remove(toDelete);
    }
  }
}
