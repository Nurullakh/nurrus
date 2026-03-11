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

    // Проверяем, есть ли уже этот товар в корзине
    const existingItem = await this.cartRepository.findOne({
      where: { productId: addToCartDto.productId, userId },
    });

    if (existingItem) {
      // Увеличиваем количество
      existingItem.quantity += addToCartDto.quantity || 1;
      return this.cartRepository.save(existingItem);
    }

    // Создаем новый элемент
    const cartItem = this.cartRepository.create({
      ...addToCartDto,
      userId,
      quantity: addToCartDto.quantity || 1,
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
    await this.cartRepository.delete({ id, userId });
  }

  async clearCart(userId: string = 'guest'): Promise<void> {
    await this.cartRepository.delete({ userId });
  }
}

