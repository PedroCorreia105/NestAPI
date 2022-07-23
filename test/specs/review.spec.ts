import { HttpStatus } from '@nestjs/common';
import { string, int } from 'pactum-matchers';
import * as pactum from 'pactum';

import { ReviewDto } from '../../src/review/dto';

const editDto: ReviewDto = {
  title: 'My updated review',
  description: 'Really Great Place',
  rating: 9,
};

describe('Reviews', () => {
  it('should create review', async () => {
    await pactum.spec('createShop', 'user1').expectStatus(HttpStatus.CREATED);

    await pactum
      .spec('createReview', 'user1')
      .expectJsonMatchStrict({
        id: string('$S{reviewId}'),
        title: string(),
        description: string(),
        rating: int(),
        userId: string(),
        shopId: string(),
      })
      .expectStatus(HttpStatus.CREATED);
  });

  it('should get user reviews', async () => {
    await pactum
      .spec()
      .get('/v1/reviews')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict([
        {
          id: string('$S{reviewId}'),
          title: string(),
          description: string(),
          rating: int(),
          userId: string(),
          shopId: string(),
        },
      ])
      .expectStatus(HttpStatus.OK);
  });

  it('should get user reviews by page', async () => {
    await pactum
      .spec()
      .get('/v1/reviews/page')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict({
        edges: [
          {
            node: {
              id: string('$S{reviewId}'),
              title: string(),
              description: string(),
              rating: int(),
              userId: string(),
              shopId: string(),
            },
            cursor: string('$S{reviewId}'),
          },
        ],
        nodes: [
          {
            id: string('$S{reviewId}'),
            title: string(),
            description: string(),
            rating: int(),
            userId: string(),
            shopId: string(),
          },
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: string('$S{reviewId}'),
          endCursor: string('$S{reviewId}'),
        },
        totalCount: 1,
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should get shop reviews', async () => {
    await pactum
      .spec()
      .get('/v1/shops/$S{shopId}/reviews')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict([
        {
          id: string('$S{reviewId}'),
          title: string(),
          description: string(),
          rating: int(),
          userId: string(),
          shopId: string(),
        },
      ])
      .expectStatus(HttpStatus.OK);
  });

  it('should get shop reviews by page', async () => {
    await pactum
      .spec()
      .get('/v1/shops/$S{shopId}/reviews/page')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict({
        edges: [
          {
            node: {
              id: string('$S{reviewId}'),
              title: string(),
              description: string(),
              rating: int(),
              userId: string(),
              shopId: string(),
            },
            cursor: string('$S{reviewId}'),
          },
        ],
        nodes: [
          {
            id: string('$S{reviewId}'),
            title: string(),
            description: string(),
            rating: int(),
            userId: string(),
            shopId: string(),
          },
        ],
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: string('$S{reviewId}'),
          endCursor: string('$S{reviewId}'),
        },
        totalCount: 1,
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should get review by id', async () => {
    await pactum
      .spec()
      .get('/v1/reviews/$S{reviewId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict({
        id: string('$S{reviewId}'),
        title: string(),
        description: string(),
        rating: int(),
        userId: string(),
        shopId: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should throw error when editing another user review', async () => {
    await pactum
      .spec()
      .patch('/v1/reviews/$S{reviewId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user2}',
      })
      .withBody(editDto)
      .expectBody({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access to resources denied',
        error: 'Forbidden',
      })
      .expectStatus(HttpStatus.FORBIDDEN);
  });

  it('should edit review', async () => {
    await pactum
      .spec()
      .patch('/v1/reviews/$S{reviewId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
        'Content-Type': 'application/json',
      })
      .withBody(editDto)
      .expectJsonMatchStrict({
        id: string('$S{reviewId}'),
        title: editDto.title,
        description: editDto.description,
        rating: editDto.rating,
        userId: string(),
        shopId: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should throw error when deleting another user review', async () => {
    await pactum
      .spec()
      .delete('/v1/reviews/$S{reviewId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user2}',
      })
      .expectBody({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access to resources denied',
        error: 'Forbidden',
      })
      .expectStatus(HttpStatus.FORBIDDEN);
  });

  it('should delete review', async () => {
    await pactum.spec('deleteReview', 'user1').expectStatus(HttpStatus.NO_CONTENT);
  });

  it('should throw error when getting nonexistent review', async () => {
    await pactum
      .spec()
      .get('/v1/reviews/$S{reviewId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Review not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when editing nonexistent review', async () => {
    await pactum
      .spec()
      .patch('/v1/reviews/$S{reviewId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
        'Content-Type': 'application/json',
      })
      .withBody(editDto)
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Review not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when deleting nonexistent review', async () => {
    await pactum
      .spec('deleteReview', 'user1')
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Review not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should get empty reviews', async () => {
    await pactum
      .spec()
      .get('/v1/reviews')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonLength(0)
      .expectStatus(HttpStatus.OK);
  });
});
