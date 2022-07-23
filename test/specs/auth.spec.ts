import { HttpStatus } from '@nestjs/common';
import { string } from 'pactum-matchers';
import * as pactum from 'pactum';

import { AuthDto } from '../../src/auth/dto';
import { getPrisma } from '../setup';

const dto: AuthDto = {
  email: 'auth@nest.com',
  username: 'auth',
  name: 'name',
  password: '123',
};

describe('Auth', () => {
  describe('Signup', () => {
    it('should throw error if signup email empty', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signup')
        .withBody({
          username: 'auth',
          name: 'name',
          password: '123',
        })
        .expectBody({
          error: 'Bad Request',
          message: ['email should not be empty', 'email must be an email'],
          statusCode: HttpStatus.BAD_REQUEST,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if signup password empty', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signup')
        .withBody({
          email: 'auth@nest.com',
          username: 'auth',
          name: 'name',
        })
        .expectBody({
          error: 'Bad Request',
          message: ['password should not be empty', 'password must be a string'],
          statusCode: HttpStatus.BAD_REQUEST,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if signup body not provided', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signup')
        .expectBody({
          error: 'Bad Request',
          message: [
            'email should not be empty',
            'email must be an email',
            'password should not be empty',
            'password must be a string',
            'username should not be empty',
            'username must be a string',
            'name should not be empty',
            'name must be a string',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should signup', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signup')
        .withBody(dto)
        .expectJsonMatchStrict({
          accessToken: string(),
          userId: string(),
        })
        .expectStatus(HttpStatus.CREATED);
    });
  });

  describe('Signin', () => {
    it('should throw error if signin email empty', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signin')
        .withBody({
          username: 'auth',
          name: 'name',
          password: '123',
        })
        .expectBody({
          error: 'Bad Request',
          message: ['email should not be empty', 'email must be an email'],
          statusCode: HttpStatus.BAD_REQUEST,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if signin password empty', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signin')
        .withBody({
          email: 'auth@nest.com',
          username: 'auth',
          name: 'name',
        })
        .expectBody({
          error: 'Bad Request',
          message: ['password should not be empty', 'password must be a string'],
          statusCode: HttpStatus.BAD_REQUEST,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if signin body not provided', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signin')
        .expectBody({
          error: 'Bad Request',
          message: [
            'email should not be empty',
            'email must be an email',
            'password should not be empty',
            'password must be a string',
            'username should not be empty',
            'username must be a string',
            'name should not be empty',
            'name must be a string',
          ],
          statusCode: HttpStatus.BAD_REQUEST,
        })
        .expectStatus(HttpStatus.BAD_REQUEST);
    });

    it('should throw error if signin password incorrect', async () => {
      const newDto = { ...dto };
      newDto.password = '321';
      await pactum
        .spec()
        .post('/v1/auth/signin')
        .withBody(newDto)
        .expectBody({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Credentials incorrect',
          error: 'Forbidden',
        })
        .expectStatus(HttpStatus.FORBIDDEN);
    });

    it('should throw error if signin email incorrect', async () => {
      const newDto = { ...dto };
      newDto.email = 'email@wrong.com';
      await pactum
        .spec()
        .post('/v1/auth/signin')
        .withBody(newDto)
        .expectBody({
          statusCode: HttpStatus.FORBIDDEN,
          message: 'Credentials incorrect',
          error: 'Forbidden',
        })
        .expectStatus(HttpStatus.FORBIDDEN);
    });

    it('should signin', async () => {
      await pactum
        .spec()
        .post('/v1/auth/signin')
        .withBody(dto)
        .expectJsonMatchStrict({
          accessToken: string(),
          userId: string(),
        })
        .expectStatus(HttpStatus.OK)
        .stores('accessToken-user1', 'accessToken');
    });
  });

  describe('Auth', () => {
    it('should throw error if user is deleted after authentication', async () => {
      await getPrisma().cleanDb();
      await pactum
        .spec()
        .get('/v1/reviews')
        .withHeaders({
          Authorization: 'Bearer $S{accessToken-user1}',
        })
        .expectBody({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'User not Found',
          error: 'Not Found',
        })
        .expectStatus(HttpStatus.NOT_FOUND);
    });
  });
});
