import { HttpStatus } from '@nestjs/common';
import { string } from 'pactum-matchers';
import * as pactum from 'pactum';

import { ShopDto } from '../../src/shop/dto';

const shopDto: ShopDto = {
  name: 'My first shop',
  description: 'Great Place',
  website: 'http://www.shop.com',
};

describe('Shops', () => {
  it('should create shop', async () => {
    await pactum
      .spec('createShop', 'user1')
      .expectJsonMatchStrict({
        id: string('$S{shopId}'),
        name: string(),
        description: string(),
        website: string(),
      })
      .expectStatus(HttpStatus.CREATED);
  });

  it('should throw error when creating a second shop', async () => {
    await pactum
      .spec()
      .post('/v1/shops')
      .withHeaders({
        Authorization: `Bearer $S{accessToken-user1}`,
      })
      .withBody(shopDto)
      .expectJsonMatch({
        statusCode: HttpStatus.CONFLICT,
        message: string(),
      })
      .expectStatus(HttpStatus.CONFLICT);
  });

  it('should get shops', async () => {
    await pactum
      .spec()
      .get('/v1/shops')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict([
        {
          id: string('$S{shopId}'),
          name: string(),
          description: string(),
          website: string(),
        },
      ])
      .expectStatus(HttpStatus.OK);
  });

  it('should get shop by id', async () => {
    await pactum
      .spec()
      .get('/v1/shops/$S{shopId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict({
        id: '$S{shopId}',
        name: string(),
        description: string(),
        website: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should throw error when editing if not manager', async () => {
    await pactum
      .spec()
      .patch('/v1/shops/$S{shopId}')
      .withPathParams('id', '$S{shopId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user2}',
      })
      .withBody(shopDto)
      .expectBody({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access to resources denied',
        error: 'Forbidden',
      })
      .expectStatus(HttpStatus.FORBIDDEN);
  });

  it('should edit shop', async () => {
    await pactum
      .spec()
      .patch('/v1/shops/$S{shopId}')
      .withPathParams('id', '$S{shopId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withBody(shopDto)
      .expectJsonMatchStrict({
        id: '$S{shopId}',
        name: shopDto.name,
        description: shopDto.description,
        website: shopDto.website,
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should throw error when deleting if not manager', async () => {
    await pactum
      .spec()
      .delete('/v1/shops/$S{shopId}')
      .withPathParams('id', '$S{shopId}')
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

  it('should delete shop', async () => {
    await pactum
      .spec('deleteShop', { shopId: '$S{shopId}', user: 'user1' })
      .expectStatus(HttpStatus.NO_CONTENT);
  });

  it('should throw error when getting nonexistent shop', async () => {
    await pactum
      .spec()
      .get('/v1/shops/$S{shopId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Shop not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when editing nonexistent shop', async () => {
    await pactum
      .spec()
      .patch('/v1/shops/$S{shopId}')
      .withPathParams('id', '$S{shopId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withBody(shopDto)
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Shop not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when deleting nonexistent shop', async () => {
    await pactum
      .spec('deleteShop', { shopId: '$S{shopId}', user: 'user1' })
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Shop not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should get empty shops', async () => {
    await pactum
      .spec()
      .get('/v1/shops')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectStatus(HttpStatus.OK)
      .expectJsonLength(0);
  });
});
