import { ArrayMinSize, IsArray, IsInt } from 'class-validator';

export class BulkProductIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  productIds: number[];
}
