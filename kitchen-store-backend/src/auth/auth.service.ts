import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const normalizedEmail = registerDto.email.trim().toLowerCase();

    let existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!existingUser) {
      existingUser = await this.usersRepository
        .createQueryBuilder('user')
        .where('LOWER(user.email) = LOWER(:email)', { email: normalizedEmail })
        .getOne();
    }

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      email: normalizedEmail,
      password: hashedPassword,
      role: 'customer',
      status: 'active',
    });

    const savedUser = await this.usersRepository.save(user);

    // Генерируем JWT токен
    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const access_token = this.jwtService.sign(payload);

    const result = {
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        role: savedUser.role,
        status: savedUser.status,
      },
      access_token,
    };

    console.log('🔐 Register SUCCESS - отправляем:', JSON.stringify(result));
    return result;
  }

  async login(loginDto: LoginDto) {
    const normalizedEmail = loginDto.email.trim().toLowerCase();

    let user = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.usersRepository
        .createQueryBuilder('user')
        .where('LOWER(user.email) = LOWER(:email)', { email: normalizedEmail })
        .getOne();
    }

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Для легаси-аккаунтов поддерживаем оба формата: bcrypt-хеш и открытый текст.
    const isBcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(
      user.password,
    );
    const isPasswordValid = isBcryptHash
      ? await bcrypt.compare(loginDto.password, user.password)
      : user.password === loginDto.password;

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (user.status === 'blocked') {
      throw new UnauthorizedException('Ваш аккаунт заблокирован');
    }

    // Генерируем JWT токен
    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    const result = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      },
      access_token,
    };

    console.log('🔐 Login SUCCESS - отправляем:', JSON.stringify(result));
    return result;
  }

  async validateUser(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'status',
        'avatar',
        'address',
        'registeredAt',
      ],
    });

    if (!user || user.status === 'blocked') {
      return null;
    }

    return user;
  }

  async getProfile(userId: number) {
    const user = await this.validateUser(userId);

    if (!user) {
      throw new UnauthorizedException(
        'Пользователь не найден или заблокирован',
      );
    }

    return user;
  }
}
