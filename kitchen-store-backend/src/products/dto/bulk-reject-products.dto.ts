import { IsOptional, IsString, MaxLength } from 'class-validator';
import { BulkProductIdsDto } from './bulk-product-ids.dto';

export class BulkRejectProductsDto extends BulkProductIdsDto {
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  reason?: string;
}
