import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { ViewHistoryService } from './view-history.service';

@Controller('view-history')
export class ViewHistoryController {
  constructor(private readonly viewHistoryService: ViewHistoryService) {}

  @Post(':productId')
  addView(
    @Param('productId') productId: string,
    @Query('userId') userId: string,
  ) {
    return this.viewHistoryService.addView(userId || 'guest', +productId);
  }

  @Get()
  getHistory(
    @Query('userId') userId: string,
    @Query('limit') limit: string = '10',
  ) {
    return this.viewHistoryService.getHistory(userId || 'guest', parseInt(limit, 10));
  }

  @Delete()
  clearHistory(@Query('userId') userId: string) {
    return this.viewHistoryService.clearHistory(userId || 'guest');
  }
}
