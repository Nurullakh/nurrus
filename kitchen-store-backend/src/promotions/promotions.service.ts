import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from './promotions.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionsRepository.create(createPromotionDto);
    return await this.promotionsRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return await this.promotionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findActive(): Promise<Promotion[]> {
    const now = new Date();
    return await this.promotionsRepository.find({
      where: {
        isActive: true,
        status: 'active',
        startDate: LessThanOrEqual(now),
        endDate: MoreThanOrEqual(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Promotion | null> {
    return await this.promotionsRepository.findOne({ where: { id } });
  }

  async findByCode(code: string): Promise<Promotion | null> {
    return await this.promotionsRepository.findOne({
      where: {
        code,
        isActive: true,
        status: 'active',
      },
    });
  }

  async update(
    id: number,
    updatePromotionDto: UpdatePromotionDto,
  ): Promise<Promotion> {
    await this.promotionsRepository.update(id, updatePromotionDto);
    const promotion = await this.findOne(id);
    if (!promotion) {
      throw new NotFoundException(`Акция с ID ${id} не найдена`);
    }
    return promotion;
  }

  async remove(id: number): Promise<void> {
    await this.promotionsRepository.delete(id);
  }

  async toggleStatus(id: number): Promise<Promotion> {
    const promotion = await this.findOne(id);
    if (!promotion) {
      throw new NotFoundException(`Акция с ID ${id} не найдена`);
    }
    promotion.status = promotion.status === 'active' ? 'paused' : 'active';
    return await this.promotionsRepository.save(promotion);
  }
}
