import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ComparisonsService } from './comparisons.service';

@Controller('comparisons')
export class ComparisonsController {
  constructor(private readonly comparisonsService: ComparisonsService) {}

  @Get()
  getComparison(@Query('userId') userId: string) {
    return this.comparisonsService.getComparison(userId || 'guest');
  }

  @Get('products')
  getComparisonProducts(@Query('userId') userId: string) {
    return this.comparisonsService.getComparisonProducts(userId || 'guest');
  }

  @Post(':productId')
  addProduct(
    @Param('productId') productId: string,
    @Query('userId') userId: string,
  ) {
    return this.comparisonsService.addProduct(userId || 'guest', +productId);
  }

  @Delete(':productId')
  removeProduct(
    @Param('productId') productId: string,
    @Query('userId') userId: string,
  ) {
    return this.comparisonsService.removeProduct(userId || 'guest', +productId);
  }

  @Delete()
  clear(@Query('userId') userId: string) {
    return this.comparisonsService.clear(userId || 'guest');
  }
}
