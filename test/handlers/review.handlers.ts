import { handler } from 'pactum';
import { ReviewDto } from '../../src/review/dto';
import { v4 as uuidv4 } from 'uuid';

handler.addSpecHandler('createReview', (ctx) => {
  const { spec, data } = ctx;
  const review: ReviewDto = {
    title: `Review Title ${uuidv4()}`,
    description: `Review Description ${uuidv4()}`,
    rating: 8,
  };

  spec
    .post('/v1/shops/$S{shopId}/reviews')
    .withHeaders({
      Authorization: `Bearer $S{accessToken-${data}}`,
    })
    .withBody(review)
    .stores('reviewId', 'id');
});

handler.addSpecHandler('deleteReview', (ctx) => {
  const { spec, data } = ctx;

  spec.delete('/v1/reviews/$S{reviewId}').withHeaders({
    Authorization: `Bearer $S{accessToken-${data}}`,
  });
});
