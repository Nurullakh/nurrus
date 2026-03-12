import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Not, Repository } from 'typeorm';
import { Address } from './addresses.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private addressesRepository: Repository<Address>,
  ) {}

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    // Если это адрес по умолчанию, снимаем флаг с других адресов пользователя
    if (createAddressDto.isDefault) {
      await this.addressesRepository.update(
        { userId: createAddressDto.userId, isDefault: true },
        { isDefault: false },
      );
    }

    const address = this.addressesRepository.create(createAddressDto);
    return await this.addressesRepository.save(address);
  }

  async findAll(userId: number): Promise<Address[]> {
    return await this.addressesRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: number, userId?: number): Promise<Address> {
    const where: FindOptionsWhere<Address> = { id };
    if (userId !== undefined) {
      where.userId = userId;
    }

    const address = await this.addressesRepository.findOne({ where });

    if (!address) {
      throw new NotFoundException(`Адрес с ID ${id} не найден`);
    }

    return address;
  }

  async update(
    id: number,
    updateAddressDto: UpdateAddressDto,
    userId?: number,
  ): Promise<Address> {
    const address = await this.findOne(id, userId);

    // Если устанавливаем адрес по умолчанию, снимаем флаг с других
    if (updateAddressDto.isDefault) {
      await this.addressesRepository.update(
        { userId: address.userId, isDefault: true, id: Not(id) },
        { isDefault: false },
      );
    }

    await this.addressesRepository.update(id, updateAddressDto);
    return await this.findOne(id);
  }

  async remove(id: number, userId?: number): Promise<void> {
    await this.findOne(id, userId);
    await this.addressesRepository.delete(id);
  }

  async setDefault(id: number, userId: number): Promise<Address> {
    const address = await this.findOne(id, userId);

    // Снимаем флаг с других адресов
    await this.addressesRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );

    // Устанавливаем новый адрес по умолчанию
    address.isDefault = true;
    return await this.addressesRepository.save(address);
  }
}
