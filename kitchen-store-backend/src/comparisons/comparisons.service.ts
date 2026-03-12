import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comparison } from './comparisons.entity';
import { Product } from '../products/products.entity';

@Injectable()
export class ComparisonsService {
  constructor(
    @InjectRepository(Comparison)
    private comparisonsRepository: Repository<Comparison>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  private readonly MAX_COMPARISON_ITEMS = 5; // Максимум товаров для сравнения

  async getComparison(userId: string): Promise<Comparison> {
    let comparison = await this.comparisonsRepository.findOne({
      where: { userId },
    });

    if (!comparison) {
      comparison = this.comparisonsRepository.create({
        userId,
        productIds: [],
      });
      await this.comparisonsRepository.save(comparison);
    }

    return comparison;
  }

  async addProduct(userId: string, productId: number): Promise<Comparison> {
    const comparison = await this.getComparison(userId);

    // Проверяем существование товара
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар с ID ${productId} не найден`);
    }

    // Проверяем, не добавлен ли уже товар
    if (comparison.productIds.includes(productId)) {
      throw new BadRequestException('Товар уже добавлен в сравнение');
    }

    // Проверяем лимит
    if (comparison.productIds.length >= this.MAX_COMPARISON_ITEMS) {
      throw new BadRequestException(
        `Максимум ${this.MAX_COMPARISON_ITEMS} товаров для сравнения`,
      );
    }

    comparison.productIds.push(productId);
    return await this.comparisonsRepository.save(comparison);
  }

  async removeProduct(userId: string, productId: number): Promise<Comparison> {
    const comparison = await this.getComparison(userId);

    comparison.productIds = comparison.productIds.filter(
      (id) => id !== productId,
    );
    return await this.comparisonsRepository.save(comparison);
  }

  async clear(userId: string): Promise<void> {
    const comparison = await this.getComparison(userId);
    comparison.productIds = [];
    await this.comparisonsRepository.save(comparison);
  }

  async getComparisonProducts(userId: string): Promise<Product[]> {
    const comparison = await this.getComparison(userId);

    if (comparison.productIds.length === 0) {
      return [];
    }

    return await this.productsRepository.find({
      where: comparison.productIds.map((id) => ({ id })),
      relations: ['categoryRelation'],
    });
  }
}
