import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsIn(['admin', 'manager', 'customer'])
  role?: string;

  @IsOptional()
  @IsIn(['active', 'blocked'])
  status?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
