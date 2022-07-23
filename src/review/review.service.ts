import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { Prisma, Review } from '@prisma/client';

import { ConnectionArgs, Page } from '../page/dto';
import { PrismaService } from '../prisma/prisma.service';
import { ReviewDto, ReviewEntity } from './dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  getShopReviews(shopId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        shopId: shopId,
      },
    });
  }

  async getShopReviewsByPage(shopId: string, connectionArgs: ConnectionArgs) {
    const where: Prisma.ReviewWhereInput = {
      shopId: shopId,
    };

    const reviewPage = await findManyCursorConnection(
      async (args) =>
        (
          await this.prisma.review.findMany({ ...args, where: where })
        ).map((review: Review) => new ReviewEntity(review)),
      () => this.prisma.review.count({ where: where }),
      connectionArgs,
    );
    return new Page<ReviewEntity>(reviewPage);
  }

  getUserReviews(userId: string): Promise<Review[]> {
    return this.prisma.review.findMany({
      where: {
        userId: userId,
      },
    });
  }

  async getUserReviewsByPage(userId: string, connectionArgs: ConnectionArgs) {
    const where: Prisma.ReviewWhereInput = {
      userId: userId,
    };
    const reviewPage = await findManyCursorConnection(
      async (args) =>
        (
          await this.prisma.review.findMany({ ...args, where: where })
        ).map((review: Review) => new ReviewEntity(review)),
      () =>
        this.prisma.review.count({
          where: where,
        }),
      connectionArgs,
    );
    return new Page<ReviewEntity>(reviewPage);
  }

  async getReviewById(reviewId: string): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) throw new NotFoundException('Review not Found');

    return review;
  }

  async createReview(userId: string, shopId: string, dto: ReviewDto): Promise<Review> {
    const review = await this.prisma.review.create({
      data: {
        ...dto,
        shop: { connect: { id: shopId } },
        user: { connect: { id: userId } },
      },
    });

    return review;
  }

  async editReviewById(
    userId: string,
    reviewId: string,
    dto: ReviewDto,
  ): Promise<Review> {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) throw new NotFoundException('Review not Found');

    if (review.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    return this.prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        ...dto,
      },
    });
  }

  async deleteReviewById(userId: string, reviewId: string) {
    const review = await this.prisma.review.findUnique({
      where: {
        id: reviewId,
      },
    });

    if (!review) throw new NotFoundException('Review not Found');

    // check if user owns the review
    if (review.userId !== userId)
      throw new ForbiddenException('Access to resources denied');

    await this.prisma.review.delete({
      where: {
        id: reviewId,
      },
    });
  }
}
