import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsOptional()
  @IsString()
  status?: string; // 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled'

  @IsOptional()
  @IsString()
  paymentStatus?: string; // 'pending' | 'paid' | 'refunded'
}
