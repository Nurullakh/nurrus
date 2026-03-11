import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `category-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createCategoryDto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Проверка обязательных полей
    if (!createCategoryDto.name || !createCategoryDto.slug) {
      throw new BadRequestException('Поля name и slug обязательны для заполнения');
    }

    // Обработка данных из FormData
    const categoryData: CreateCategoryDto = {
      name: createCategoryDto.name,
      slug: createCategoryDto.slug,
      parentId: createCategoryDto.parentId ? parseInt(createCategoryDto.parentId, 10) : undefined,
      order: createCategoryDto.order ? parseInt(createCategoryDto.order, 10) : 1,
      description: createCategoryDto.description || undefined,
      isActive: createCategoryDto.isActive === 'true' || createCategoryDto.isActive === true || createCategoryDto.isActive === undefined,
    };

    if (file) {
      categoryData.image = `/uploads/categories/${file.filename}`;
    } else if (createCategoryDto.image && typeof createCategoryDto.image === 'string') {
      categoryData.image = createCategoryDto.image;
    }

    return this.categoriesService.create(categoryData);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get('tree')
  findTree() {
    return this.categoriesService.findTree();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/categories',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `category-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // Обработка данных из FormData
    const categoryData: UpdateCategoryDto = {};

    if (updateCategoryDto.name !== undefined) {
      categoryData.name = updateCategoryDto.name;
    }
    if (updateCategoryDto.slug !== undefined) {
      categoryData.slug = updateCategoryDto.slug;
    }
    if (updateCategoryDto.parentId !== undefined) {
      categoryData.parentId = updateCategoryDto.parentId ? parseInt(updateCategoryDto.parentId, 10) : undefined;
    }
    if (updateCategoryDto.order !== undefined) {
      categoryData.order = updateCategoryDto.order ? parseInt(updateCategoryDto.order, 10) : undefined;
    }
    if (updateCategoryDto.description !== undefined) {
      categoryData.description = updateCategoryDto.description || undefined;
    }
    if (updateCategoryDto.isActive !== undefined) {
      categoryData.isActive = updateCategoryDto.isActive === 'true' || updateCategoryDto.isActive === true;
    }

    if (file) {
      categoryData.image = `/uploads/categories/${file.filename}`;
    } else if (updateCategoryDto.image && typeof updateCategoryDto.image === 'string') {
      categoryData.image = updateCategoryDto.image;
    }

    return this.categoriesService.update(+id, categoryData);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(+id);
  }
}

