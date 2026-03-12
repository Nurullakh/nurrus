import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  Min,
  Max,
  IsEmail,
} from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  productId: number;

  @IsNumber()
  @IsOptional()
  userId?: number;

  @IsString()
  userName: string;

  @IsEmail()
  userEmail: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  comment: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  orderNumber?: string; // Для проверки покупки
}
