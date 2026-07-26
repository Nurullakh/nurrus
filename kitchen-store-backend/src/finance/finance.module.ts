import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinancePayout } from './finance-payout.entity';
import { Order } from '../orders/orders.entity';
import { User } from '../users/users.entity';
import { RolesGuard } from '../auth/guards/roles.guard';

@Module({
  imports: [TypeOrmModule.forFeature([FinancePayout, Order, User])],
  controllers: [FinanceController],
  providers: [FinanceService, RolesGuard],
  exports: [FinanceService],
})
export class FinanceModule {}
