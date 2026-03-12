import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private static readonly BCRYPT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const normalizedEmail = createUserDto.email.trim().toLowerCase();

    // Проверяем существует ли пользователь с таким email
    const existingUser = await this.usersRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hashedPassword = await bcrypt.hash(
      createUserDto.password,
      UsersService.BCRYPT_ROUNDS,
    );

    const user = this.usersRepository.create({
      ...createUserDto,
      email: normalizedEmail,
      password: hashedPassword,
    });

    return await this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.usersRepository.find({
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'status',
        'registeredAt',
      ],
      order: { registeredAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: [
        'id',
        'name',
        'email',
        'phone',
        'role',
        'status',
        'address',
        'avatar',
        'registeredAt',
      ],
    });

    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    await this.findOne(id);

    if (updateUserDto.email) {
      updateUserDto.email = updateUserDto.email.trim().toLowerCase();
    }

    if (updateUserDto.password) {
      const isBcryptHash = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(
        updateUserDto.password,
      );
      if (!isBcryptHash) {
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          UsersService.BCRYPT_ROUNDS,
        );
      }
    }

    await this.usersRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.usersRepository.delete(id);
  }

  async toggleStatus(id: number): Promise<User> {
    const user = await this.findOne(id);
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    await this.usersRepository.update(id, { status: newStatus });
    return await this.findOne(id);
  }

  async getStatistics() {
    const totalUsers = await this.usersRepository.count();
    const activeUsers = await this.usersRepository.count({
      where: { status: 'active' },
    });
    const admins = await this.usersRepository.count({
      where: { role: 'admin' },
    });
    const customers = await this.usersRepository.count({
      where: { role: 'customer' },
    });

    return {
      totalUsers,
      activeUsers,
      admins,
      customers,
    };
  }
}
