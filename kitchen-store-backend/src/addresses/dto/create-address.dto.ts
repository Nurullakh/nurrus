import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateAddressDto {
  @IsNumber()
  userId: number;

  @IsString()
  title: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  phone: string;

  @IsString()
  city: string;

  @IsString()
  street: string;

  @IsString()
  house: string;

  @IsString()
  @IsOptional()
  apartment?: string;

  @IsString()
  postalCode: string;

  @IsString()
  @IsOptional()
  entrance?: string;

  @IsString()
  @IsOptional()
  floor?: string;

  @IsString()
  @IsOptional()
  intercom?: string;

  @IsString()
  @IsOptional()
  comment?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
