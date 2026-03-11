import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Banner } from './banners.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner)
    private bannersRepository: Repository<Banner>,
  ) {}

  async create(createBannerDto: CreateBannerDto): Promise<Banner> {
    const banner = this.bannersRepository.create(createBannerDto);
    return await this.bannersRepository.save(banner);
  }

  async findAll(position?: string, device?: string): Promise<Banner[]> {
    const query = this.bannersRepository
      .createQueryBuilder('banner')
      .where('banner.isActive = :isActive', { isActive: true });

    if (position) {
      query.andWhere('banner.position = :position', { position });
    }

    if (device) {
      query.andWhere(
        '(banner.device = :device OR banner.device = :all)',
        { device, all: 'all' },
      );
    }

    return await query.orderBy('banner.order', 'ASC').getMany();
  }

  async findAllForAdmin(): Promise<Banner[]> {
    return await this.bannersRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Banner | null> {
    return await this.bannersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateBannerDto: UpdateBannerDto): Promise<Banner> {
    await this.bannersRepository.update(id, updateBannerDto);
    const banner = await this.findOne(id);
    if (!banner) {
      throw new Error(`Banner с ID ${id} не найден`);
    }
    return banner;
  }

  async remove(id: number): Promise<void> {
    await this.bannersRepository.delete(id);
  }

  async toggleStatus(id: number): Promise<Banner> {
    const banner = await this.findOne(id);
    if (!banner) {
      throw new Error(`Banner с ID ${id} не найден`);
    }
    banner.isActive = !banner.isActive;
    return await this.bannersRepository.save(banner);
  }
}

