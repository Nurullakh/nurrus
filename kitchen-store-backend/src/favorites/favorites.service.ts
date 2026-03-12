import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FavoriteItem } from './favorites.entity';
import { AddToFavoritesDto } from './dto/add-to-favorites.dto';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(FavoriteItem)
    private favoritesRepository: Repository<FavoriteItem>,
  ) {}

  async findAll(userId: string = 'guest'): Promise<FavoriteItem[]> {
    return this.favoritesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async addItem(addToFavoritesDto: AddToFavoritesDto): Promise<FavoriteItem> {
    const userId = addToFavoritesDto.userId || 'guest';

    // Проверяем, есть ли уже этот товар в избранном
    const existingItem = await this.favoritesRepository.findOne({
      where: { productId: addToFavoritesDto.productId, userId },
    });

    if (existingItem) {
      // Если уже есть, возвращаем существующий
      return existingItem;
    }

    // Создаем новый элемент
    const favoriteItem = this.favoritesRepository.create({
      ...addToFavoritesDto,
      userId,
    });

    return this.favoritesRepository.save(favoriteItem);
  }

  async removeItem(productId: number, userId: string = 'guest'): Promise<void> {
    await this.favoritesRepository.delete({ productId, userId });
  }

  async toggleItem(
    addToFavoritesDto: AddToFavoritesDto,
  ): Promise<{ added: boolean; item?: FavoriteItem }> {
    const userId = addToFavoritesDto.userId || 'guest';

    const existingItem = await this.favoritesRepository.findOne({
      where: { productId: addToFavoritesDto.productId, userId },
    });

    if (existingItem) {
      await this.favoritesRepository.delete({ id: existingItem.id });
      return { added: false };
    }

    const favoriteItem = this.favoritesRepository.create({
      ...addToFavoritesDto,
      userId,
    });

    const savedItem = await this.favoritesRepository.save(favoriteItem);
    return { added: true, item: savedItem };
  }

  async clearFavorites(userId: string = 'guest'): Promise<void> {
    await this.favoritesRepository.delete({ userId });
  }
}
