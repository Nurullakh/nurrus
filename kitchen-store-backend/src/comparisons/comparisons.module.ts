import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComparisonsService } from './comparisons.service';
import { ComparisonsController } from './comparisons.controller';
import { Comparison } from './comparisons.entity';
import { Product } from '../products/products.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Comparison, Product])],
  providers: [ComparisonsService],
  controllers: [ComparisonsController],
  exports: [ComparisonsService],
})
export class ComparisonsModule {}
