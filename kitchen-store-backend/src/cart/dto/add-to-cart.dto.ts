import {
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
} from 'class-validator';

export class AddToCartDto {
  @IsNumber()
  productId: number;

  @IsString()
  name: string;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsArray()
  images?: string[];

  @IsOptional()
  @IsString()
  article?: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsBoolean()
  available?: boolean;

  @IsOptional()
  @IsString()
  userId?: string;
}
