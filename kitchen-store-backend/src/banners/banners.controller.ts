import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { BannersService } from './banners.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

const bannersUploadDir = join(process.cwd(), 'uploads', 'banners');

const bannerStorage = diskStorage({
  destination: (req, file, callback) => {
    if (!existsSync(bannersUploadDir)) {
      mkdirSync(bannersUploadDir, { recursive: true });
    }
    callback(null, bannersUploadDir);
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    callback(null, `banner-${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: bannerStorage,
    }),
  )
  create(
    @Body() createBannerDto: CreateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      createBannerDto.imageUrl = `/uploads/banners/${file.filename}`;
    }
    if (!createBannerDto.imageUrl) {
      throw new BadRequestException('Для создания баннера нужно изображение');
    }
    return this.bannersService.create(createBannerDto);
  }

  @Get()
  findAll(
    @Query('position') position?: string,
    @Query('device') device?: string,
  ) {
    return this.bannersService.findAll(position, device);
  }

  @Get('admin')
  findAllForAdmin() {
    return this.bannersService.findAllForAdmin();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(+id);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: bannerStorage,
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateBannerDto: UpdateBannerDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (file) {
      updateBannerDto.imageUrl = `/uploads/banners/${file.filename}`;
    }
    return this.bannersService.update(+id, updateBannerDto);
  }

  @Put(':id/toggle')
  toggleStatus(@Param('id') id: string) {
    return this.bannersService.toggleStatus(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bannersService.remove(+id);
  }
}

