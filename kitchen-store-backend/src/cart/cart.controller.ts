import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  async getCart(@Query('userId') userId: string = 'guest') {
    return this.cartService.findAll(userId);
  }

  @Post()
  async addToCart(@Body() addToCartDto: AddToCartDto) {
    return this.cartService.addItem(addToCartDto);
  }

  @Put(':id/quantity')
  async updateQuantity(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity') quantity: number,
    @Query('userId') userId: string = 'guest',
  ) {
    return this.cartService.updateQuantity(id, quantity, userId);
  }

  @Delete(':id')
  async removeFromCart(
    @Param('id', ParseIntPipe) id: number,
    @Query('userId') userId: string = 'guest',
  ) {
    await this.cartService.removeItem(id, userId);
    return { success: true };
  }

  @Delete()
  async clearCart(@Query('userId') userId: string = 'guest') {
    await this.cartService.clearCart(userId);
    return { success: true };
  }
}
