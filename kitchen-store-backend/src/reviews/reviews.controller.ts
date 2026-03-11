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
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: diskStorage({
        destination: './uploads/reviews',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, `review-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  create(
    @Body() createReviewDto: any,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const reviewData: CreateReviewDto = {
      productId: parseInt(createReviewDto.productId, 10),
      userId: createReviewDto.userId ? parseInt(createReviewDto.userId, 10) : undefined,
      userName: createReviewDto.userName,
      userEmail: createReviewDto.userEmail,
      rating: parseInt(createReviewDto.rating, 10),
      comment: createReviewDto.comment,
      orderNumber: createReviewDto.orderNumber,
    };

    if (files && files.length > 0) {
      reviewData.images = files.map((file) => `/uploads/reviews/${file.filename}`);
    }

    return this.reviewsService.create(reviewData);
  }

  @Get()
  findAll(
    @Query('productId') productId?: string,
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ) {
    return this.reviewsService.findAll(
      productId ? parseInt(productId, 10) : undefined,
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('stats/:productId')
  getStats(@Param('productId') productId: string) {
    return this.reviewsService.getProductReviewsStats(parseInt(productId, 10));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Post(':id/helpful')
  markHelpful(@Param('id') id: string) {
    return this.reviewsService.markHelpful(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}
