import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './reviews.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Product } from '../products/products.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createReviewDto: CreateReviewDto): Promise<Review> {
    // Проверяем существование товара
    const product = await this.productsRepository.findOne({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new NotFoundException(`Товар с ID ${createReviewDto.productId} не найден`);
    }

    // Проверяем, не оставлял ли пользователь уже отзыв на этот товар
    if (createReviewDto.userId) {
      const existingReview = await this.reviewsRepository.findOne({
        where: {
          productId: createReviewDto.productId,
          userId: createReviewDto.userId,
        },
      });

      if (existingReview) {
        throw new BadRequestException('Вы уже оставили отзыв на этот товар');
      }
    }

    const review = this.reviewsRepository.create({
      ...createReviewDto,
      isVerified: !!createReviewDto.orderNumber, // Если есть номер заказа, значит покупка подтверждена
    });

    const savedReview = await this.reviewsRepository.save(review);

    // Обновляем рейтинг товара
    await this.updateProductRating(createReviewDto.productId);

    return savedReview;
  }

  async findAll(productId?: number, page: number = 1, limit: number = 10) {
    const queryBuilder = this.reviewsRepository
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.user', 'user')
      .where('review.isPublished = :isPublished', { isPublished: true });

    if (productId) {
      queryBuilder.andWhere('review.productId = :productId', { productId });
    }

    queryBuilder
      .orderBy('review.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!review) {
      throw new NotFoundException(`Отзыв с ID ${id} не найден`);
    }

    return review;
  }

  async update(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);
    await this.reviewsRepository.update(id, updateReviewDto);

    // Если изменился рейтинг, обновляем рейтинг товара
    if (updateReviewDto.rating) {
      await this.updateProductRating(review.productId);
    }

    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    const productId = review.productId;

    await this.reviewsRepository.delete(id);

    // Обновляем рейтинг товара после удаления отзыва
    await this.updateProductRating(productId);
  }

  async markHelpful(id: number): Promise<Review> {
    const review = await this.findOne(id);
    review.helpfulCount += 1;
    return await this.reviewsRepository.save(review);
  }

  async getProductReviewsStats(productId: number) {
    const reviews = await this.reviewsRepository.find({
      where: { productId, isPublished: true },
    });

    const total = reviews.length;
    if (total === 0) {
      return {
        total: 0,
        averageRating: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = sum / total;

    const ratingDistribution = reviews.reduce(
      (acc, review) => {
        acc[review.rating] = (acc[review.rating] || 0) + 1;
        return acc;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    );

    return {
      total,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    };
  }

  private async updateProductRating(productId: number): Promise<void> {
    const stats = await this.getProductReviewsStats(productId);

    await this.productsRepository.update(productId, {
      rating: stats.averageRating,
      reviews_count: stats.total,
    });
  }
}
