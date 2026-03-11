import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Category } from './categories.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async findAll(): Promise<Category[]> {
    return await this.categoriesRepository.find({
      order: { order: 'ASC', name: 'ASC' },
    });
  }

  async findTree(): Promise<any[]> {
    const categories = await this.findAll();
    return this.buildTree(categories);
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Категория с ID ${id} не найдена`);
    }
    return category;
  }

  async findBySlug(slug: string): Promise<Category> {
    const category = await this.categoriesRepository.findOne({ where: { slug } });
    if (!category) {
      throw new NotFoundException(`Категория со slug ${slug} не найдена`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findOne(id);
    await this.categoriesRepository.update(id, updateCategoryDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    // Проверяем есть ли подкатегории
    const childCategories = await this.categoriesRepository.find({
      where: { parentId: id },
    });

    if (childCategories.length > 0) {
      throw new Error('Нельзя удалить категорию с подкатегориями');
    }

    const category = await this.findOne(id);
    await this.categoriesRepository.delete(id);
  }

  async updateProductCount(categoryId: number): Promise<void> {
    // TODO: Обновить количество товаров в категории
    // Это можно вызывать при добавлении/удалении товара
  }

  private buildTree(categories: Category[], parentId: number | null = null): any[] {
    return categories
      .filter(cat => cat.parentId === parentId)
      .map(cat => ({
        ...cat,
        children: this.buildTree(categories, cat.id),
      }));
  }
}

