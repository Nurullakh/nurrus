import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @IsNumber()
  @IsOptional()
  categoryId?: number;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsObject()
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    if (!value.trim()) return {};
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  })
  specifications?: Record<string, any>;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(5)
  rating?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  reviews_count?: number;

  @IsBoolean()
  @IsOptional()
  is_available?: boolean;

  @IsString()
  @IsOptional()
  article?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  stock?: number;
}
