import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // Helper для парсинга specifications если они пришли как строка
  private parseSpecifications(product: Product): Product {
    if (product && product.specifications) {
      if (typeof product.specifications === 'string') {
        try {
          product.specifications = JSON.parse(product.specifications);
        } catch {
          product.specifications = {};
        }
      }
    }
    return product;
  }

  // Helper для массива продуктов
  private parseSpecificationsArray(products: Product[]): Product[] {
    return products.map(product => this.parseSpecifications(product));
  }

  async findAllPaginated(page: number = 1, limit: number = 10) {
    const [products, total] = await this.productsRepository.findAndCount({
      take: limit,
      skip: (page - 1) * limit,
      relations: ['categoryRelation'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<Product | null> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['categoryRelation'],
    });
    return product ? this.parseSpecifications(product) : null;
  }

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const newProduct = this.productsRepository.create({
      ...dto,
      rating: dto.rating ?? 0, // Если не передан, то 0
      reviews_count: dto.reviews_count ?? 0,
      is_available: dto.is_available ?? true,
    });
    return await this.productsRepository.save(newProduct);
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const products = await this.productsRepository
      .createQueryBuilder('product')
      .where('LOWER(product.name) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(product.description) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .orWhere('LOWER(product.category) LIKE LOWER(:query)', {
        query: `%${query}%`,
      })
      .take(limit)
      .getMany();

    return this.parseSpecificationsArray(products);
  }

  async getCategories(): Promise<string[]> {
    const result = await this.productsRepository
      .createQueryBuilder('product')
      .select('DISTINCT product.category', 'category')
      .where('product.category IS NOT NULL')
      .andWhere("product.category != ''")
      .getRawMany();

    return result.map((r) => r.category).filter(Boolean);
  }

  async findByCategory(
    category: string,
    page: number = 1,
    limit: number = 40,
  ) {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { category },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['categoryRelation'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      category,
    };
  }

  async findByCategoryId(
    categoryId: number,
    page: number = 1,
    limit: number = 40,
  ) {
    const [products, total] = await this.productsRepository.findAndCount({
      where: { categoryId },
      take: limit,
      skip: (page - 1) * limit,
      relations: ['categoryRelation'],
      order: { createdAt: 'DESC' },
    });

    return {
      data: this.parseSpecificationsArray(products),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      categoryId,
    };
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    await this.productsRepository.update(id, dto);
    const updatedProduct = await this.findOne(id);
    
    if (!updatedProduct) {
      throw new NotFoundException(`Товар с ID ${id} не найден после обновления`);
    }
    
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<void> {
    const product = await this.findOne(id);
    
    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    await this.productsRepository.delete(id);
  }
}
