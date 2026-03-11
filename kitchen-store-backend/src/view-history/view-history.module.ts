import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ViewHistoryService } from './view-history.service';
import { ViewHistoryController } from './view-history.controller';
import { ViewHistory } from './view-history.entity';
import { Product } from '../products/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ViewHistory, Product])],
  providers: [ViewHistoryService],
  controllers: [ViewHistoryController],
  exports: [ViewHistoryService],
})
export class ViewHistoryModule {}
