import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некорректный email адрес' })
  email: string;

  @IsString({ message: 'Пароль обязателен для заполнения' })
  @MinLength(1, { message: 'Пароль не может быть пустым' })
  password: string;
}

