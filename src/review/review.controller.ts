import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Review } from '@prisma/client';

import { ApiPageResponse } from '../page/api-page-response.decorator';
import { ConnectionArgs } from '../page/dto';
import { GetUser } from '../auth/decorator';
import { JwtGuard } from '../auth/guard';
import { ReviewDto, ReviewEntity } from './dto';
import { ReviewService } from './review.service';

@UseGuards(JwtGuard)
@ApiTags('Reviews')
@ApiBearerAuth()
@Controller()
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Get('shops/:shopId/reviews')
  @ApiOkResponse({ type: [ReviewEntity] })
  async getShopReviews(@Param('shopId') shopId: string): Promise<ReviewEntity[]> {
    const reviews = await this.reviewService.getShopReviews(shopId);
    return reviews.map((review: Review) => new ReviewEntity(review));
  }

  @Get('shops/:shopId/reviews/page')
  @ApiPageResponse(ReviewEntity)
  async getShopReviewsByPage(
    @Param('shopId') shopId: string,
    @Query() connectionArgs: ConnectionArgs,
  ) {
    return this.reviewService.getShopReviewsByPage(shopId, connectionArgs);
  }

  @Get('reviews')
  @ApiOkResponse({ type: [ReviewEntity] })
  async getUserReviews(@GetUser('id') userId: string): Promise<ReviewEntity[]> {
    const reviews = await this.reviewService.getUserReviews(userId);
    return reviews.map((review: Review) => new ReviewEntity(review));
  }

  @Get('reviews/page')
  @ApiPageResponse(ReviewEntity)
  async getUserReviewsByPage(
    @GetUser('id') userId: string,
    @Query() connectionArgs: ConnectionArgs,
  ) {
    return this.reviewService.getUserReviewsByPage(userId, connectionArgs);
  }

  @Get('reviews/:reviewId')
  @ApiOkResponse({ type: ReviewEntity })
  async getReviewById(@Param('reviewId') reviewId: string): Promise<ReviewEntity> {
    return new ReviewEntity(await this.reviewService.getReviewById(reviewId));
  }

  @Post('shops/:shopId/reviews')
  @ApiCreatedResponse({ type: ReviewEntity })
  async createReview(
    @GetUser('id') userId: string,
    @Param('shopId') shopId: string,
    @Body() dto: ReviewDto,
  ): Promise<ReviewEntity> {
    return new ReviewEntity(await this.reviewService.createReview(userId, shopId, dto));
  }

  @Patch('reviews/:reviewId')
  @ApiCreatedResponse({ type: ReviewEntity })
  async editReviewById(
    @GetUser('id') userId: string,
    @Param('reviewId') reviewId: string,
    @Body() reviewDto: ReviewDto,
  ): Promise<ReviewEntity> {
    return new ReviewEntity(
      await this.reviewService.editReviewById(userId, reviewId, reviewDto),
    );
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('reviews/:reviewId')
  deleteReviewById(@GetUser('id') userId: string, @Param('reviewId') reviewId: string) {
    return this.reviewService.deleteReviewById(userId, reviewId);
  }
}
