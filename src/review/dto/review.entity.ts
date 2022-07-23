import { Review } from '@prisma/client';

export class ReviewEntity {
  id: string;
  title: string | null;
  description: string | null;
  rating: number | null;
  userId: string;
  shopId: string;

  constructor(review: Review) {
    this.id = review.id;
    this.title = review.title;
    this.description = review.description;
    this.rating = review.rating;
    this.userId = review.userId;
    this.shopId = review.shopId;
  }
}
