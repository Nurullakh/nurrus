import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  slug?: string;

  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @IsOptional()
  productCount?: number;
}
