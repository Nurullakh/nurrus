import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { BulkProductIdsDto } from './bulk-product-ids.dto';

export class BulkUpdatePriceStockDto extends BulkProductIdsDto {
  @IsOptional()
  @IsIn(['set', 'delta'])
  priceMode?: 'set' | 'delta';

  @IsOptional()
  @IsNumber()
  priceValue?: number;

  @IsOptional()
  @IsIn(['set', 'delta'])
  stockMode?: 'set' | 'delta';

  @IsOptional()
  @IsNumber()
  stockValue?: number;
}
