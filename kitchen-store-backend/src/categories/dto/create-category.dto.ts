import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @Transform(({ value }) => (value ? parseInt(value, 10) : undefined))
  @IsNumber()
  @IsOptional()
  parentId?: number;

  @Transform(({ value }) => (value ? parseInt(value, 10) : 1))
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
    return true;
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
