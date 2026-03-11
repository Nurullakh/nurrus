import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { AddToFavoritesDto } from './dto/add-to-favorites.dto';

@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  async getFavorites(@Query('userId') userId: string = 'guest') {
    return this.favoritesService.findAll(userId);
  }

  @Post()
  async addToFavorites(@Body() addToFavoritesDto: AddToFavoritesDto) {
    return this.favoritesService.addItem(addToFavoritesDto);
  }

  @Post('toggle')
  async toggleFavorite(@Body() addToFavoritesDto: AddToFavoritesDto) {
    return this.favoritesService.toggleItem(addToFavoritesDto);
  }

  @Delete(':productId')
  async removeFromFavorites(
    @Param('productId') productId: number,
    @Query('userId') userId: string = 'guest',
  ) {
    await this.favoritesService.removeItem(productId, userId);
    return { success: true };
  }

  @Delete()
  async clearFavorites(@Query('userId') userId: string = 'guest') {
    await this.favoritesService.clearFavorites(userId);
    return { success: true };
  }
}

