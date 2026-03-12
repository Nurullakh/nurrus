import {
  Body,
  BadRequestException,
  Controller,
  Get,
  Put,
  Delete,
  NotFoundException,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get('search')
  searchProducts(
    @Query('q') query: string,
    @Query('limit') limit: number = 10,
  ) {
    return this.productsService.searchProducts(query, Number(limit));
  }

  @Get('categories')
  getCategories() {
    return this.productsService.getCategories();
  }

  @Get('category/:category')
  getProductsByCategory(
    @Param('category') category: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 40,
  ) {
    return this.productsService.findByCategory(
      category,
      Number(page),
      Number(limit),
    );
  }

  @Get('by-category-id/:categoryId')
  getProductsByCategoryId(
    @Param('categoryId') categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 40,
  ) {
    return this.productsService.findByCategoryId(
      Number(categoryId),
      Number(page),
      Number(limit),
    );
  }

  @Get()
  getProductsPaginated(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.productsService.findAllPaginated(Number(page), Number(limit));
  }

  @Get(':id')
  async getProduct(@Param('id') id: number): Promise<Product> {
    const product = await this.productsService.findOne(id);

    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    return product;
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(
            new BadRequestException(
              'Разрешены только изображения: jpg, jpeg, png, gif, webp',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const imagePaths = files ? files.map((file) => file.filename) : [];

    // Парсим specifications если пришли как строка из FormData
    let specifications = createProductDto.specifications;
    if (typeof specifications === 'string') {
      try {
        specifications = JSON.parse(specifications);
      } catch {
        specifications = {};
      }
    }

    return this.productsService.createProduct({
      ...createProductDto,
      specifications,
      images: imagePaths,
    });
  }

  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
          return callback(
            new BadRequestException(
              'Разрешены только изображения: jpg, jpeg, png, gif, webp',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (files && files.length > 0) {
      const imagePaths = files.map((file) => file.filename);
      updateProductDto.images = imagePaths;
    }

    // Парсим specifications если пришли как строка из FormData
    if (
      updateProductDto.specifications &&
      typeof updateProductDto.specifications === 'string'
    ) {
      try {
        updateProductDto.specifications = JSON.parse(
          updateProductDto.specifications,
        );
      } catch {
        updateProductDto.specifications = {};
      }
    }

    return this.productsService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: number) {
    await this.productsService.deleteProduct(id);
    return { message: 'Товар успешно удален' };
  }
}
