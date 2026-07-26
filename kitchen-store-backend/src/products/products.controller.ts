import {
  Body,
  BadRequestException,
  Controller,
  UseGuards,
  Get,
  Put,
  Delete,
  NotFoundException,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { ProductsService } from './products.service';
import { Product } from './products.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { RejectProductDto } from './dto/reject-product.dto';
import { BulkProductIdsDto } from './dto/bulk-product-ids.dto';
import { BulkRejectProductsDto } from './dto/bulk-reject-products.dto';
import { BulkUpdatePriceStockDto } from './dto/bulk-update-price-stock.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/users.entity';

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
    @Query('search') search?: string,
  ) {
    return this.productsService.findAllPaginated(Number(page), Number(limit), search);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @Get('admin/list')
  getAdminProductsPaginated(
    @CurrentUser() user: User,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('moderationStatus') moderationStatus?: string,
  ) {
    return this.productsService.findAdminPaginated(
      { id: user.id, role: user.role },
      Number(page),
      Number(limit),
      search,
      moderationStatus,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @Get('admin/export')
  async exportAdminProducts(
    @CurrentUser() user: User,
    @Query('search') search?: string,
    @Query('moderationStatus') moderationStatus?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    const csv = await this.productsService.exportAdminProducts(
      { id: user.id, role: user.role },
      search,
      moderationStatus,
    );

    if (res) {
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="products-${new Date()
          .toISOString()
          .slice(0, 10)}.csv"`,
      );
    }

    return csv;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @Post('admin/import')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (req, file, callback) => {
        if (!file.originalname.match(/\.(csv)$/i)) {
          return callback(
            new BadRequestException('Разрешен только CSV файл'),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  importAdminProducts(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Файл импорта не передан');
    }

    return this.productsService.importAdminProductsFromCsv(
      { id: user.id, role: user.role },
      file.buffer,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @Get('admin/statistics')
  getAdminStatistics(@CurrentUser() user: User) {
    return this.productsService.getAdminStatistics({ id: user.id, role: user.role });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Post(':id/submit-moderation')
  submitForModeration(@Param('id') id: number, @CurrentUser() user: User) {
    return this.productsService.submitForModeration(Number(id), {
      id: user.id,
      role: user.role,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('admin/:id/approve')
  approveProduct(@Param('id') id: number, @CurrentUser() user: User) {
    return this.productsService.approveProduct(Number(id), {
      id: user.id,
      role: user.role,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('admin/:id/reject')
  rejectProduct(
    @Param('id') id: number,
    @Body() rejectDto: RejectProductDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.rejectProduct(
      Number(id),
      { id: user.id, role: user.role },
      rejectDto.reason,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('seller')
  @Post('admin/bulk/submit-moderation')
  bulkSubmitForModeration(
    @Body() body: BulkProductIdsDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.bulkSubmitForModeration(body.productIds, {
      id: user.id,
      role: user.role,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('admin/bulk/approve')
  bulkApproveProducts(
    @Body() body: BulkProductIdsDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.bulkApproveProducts(body.productIds, {
      id: user.id,
      role: user.role,
    });
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put('admin/bulk/reject')
  bulkRejectProducts(
    @Body() body: BulkRejectProductsDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.bulkRejectProducts(
      body.productIds,
      body.reason,
      { id: user.id, role: user.role },
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  @Put('admin/bulk/price-stock')
  bulkUpdatePriceStock(
    @Body() body: BulkUpdatePriceStockDto,
    @CurrentUser() user: User,
  ) {
    return this.productsService.bulkUpdatePriceAndStock(
      body.productIds,
      {
        priceMode: body.priceMode,
        priceValue: body.priceValue,
        stockMode: body.stockMode,
        stockValue: body.stockValue,
      },
      { id: user.id, role: user.role },
    );
  }

  @Get(':id')
  async getProduct(@Param('id') id: number): Promise<Product> {
    const product = await this.productsService.findPublicOne(Number(id));

    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    return product;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
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
    @CurrentUser() user: User,
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
    }, { id: user.id, role: user.role });
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
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
    @CurrentUser() user: User,
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

    return this.productsService.updateProduct(id, updateProductDto, {
      id: user.id,
      role: user.role,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'seller')
  async deleteProduct(@Param('id') id: number, @CurrentUser() user: User) {
    await this.productsService.deleteProduct(id, { id: user.id, role: user.role });
    return { message: 'Товар успешно удален' };
  }
}
