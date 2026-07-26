import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { FinanceService } from './finance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/users.entity';
import { RequestPayoutDto } from './dto/request-payout.dto';
import { UpdatePayoutStatusDto } from './dto/update-payout-status.dto';

@Controller('finance')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'seller')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('summary')
  getSummary(@CurrentUser() user: User) {
    return this.financeService.getSummary({ id: user.id, role: user.role });
  }

  @Get('payouts')
  getPayouts(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
    @Query('status') status?: string,
    @Query('sellerId') sellerId?: string,
  ) {
    return this.financeService.getPayouts(
      { id: user.id, role: user.role },
      Number(page),
      Number(limit),
      status,
      sellerId ? Number(sellerId) : undefined,
    );
  }

  @Post('payouts/request')
  @Roles('seller')
  requestPayout(
    @CurrentUser() user: User,
    @Body() requestPayoutDto: RequestPayoutDto,
  ) {
    return this.financeService.requestPayout(
      { id: user.id, role: user.role },
      requestPayoutDto,
    );
  }

  @Put('payouts/:id/status')
  @Roles('admin')
  updatePayoutStatus(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePayoutStatusDto: UpdatePayoutStatusDto,
  ) {
    return this.financeService.updatePayoutStatus(
      { id: user.id, role: user.role },
      id,
      updatePayoutStatusDto,
    );
  }
}
