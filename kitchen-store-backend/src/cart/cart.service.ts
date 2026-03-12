import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './cart.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private cartRepository: Repository<CartItem>,
  ) {}

  async findAll(userId: string = 'guest'): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async addItem(addToCartDto: AddToCartDto): Promise<CartItem> {
    const userId = addToCartDto.userId || 'guest';
    const requestedQuantity = addToCartDto.quantity ?? 1;

    // Проверяем, есть ли уже этот товар в корзине
    const existingItem = await this.cartRepository.findOne({
      where: { productId: addToCartDto.productId, userId },
    });

    if (existingItem) {
      // Если количество пришло явно (как в add-to-cart), используем его как итоговое.
      // Это предотвращает "воскрешение" старого quantity после удаления/повторного добавления.
      existingItem.quantity = requestedQuantity;
      return this.cartRepository.save(existingItem);
    }

    // Создаем новый элемент
    const cartItem = this.cartRepository.create({
      ...addToCartDto,
      userId,
      quantity: requestedQuantity,
    });

    return this.cartRepository.save(cartItem);
  }

  async updateQuantity(
    id: number,
    quantity: number,
    userId: string = 'guest',
  ): Promise<CartItem> {
    const item = await this.cartRepository.findOne({ where: { id, userId } });
    if (!item) {
      throw new Error('Товар не найден в корзине');
    }

    item.quantity = quantity;
    return this.cartRepository.save(item);
  }

  async removeItem(id: number, userId: string = 'guest'): Promise<void> {
    const existingItem = await this.cartRepository.findOne({ where: { id, userId } });
    if (!existingItem) {
      return;
    }

    // Чистим все дубли этого товара в корзине пользователя (если вдруг появились из-за гонок).
    await this.cartRepository.delete({ productId: existingItem.productId, userId });
  }

  async clearCart(userId: string = 'guest'): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}

