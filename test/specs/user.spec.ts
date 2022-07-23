import { HttpStatus } from '@nestjs/common';
import { string } from 'pactum-matchers';
import * as pactum from 'pactum';

import { UserDto } from 'src/user/dto';

const dto: UserDto = {
  email: 'user@nest.com',
  username: 'user',
  name: 'user name',
};

describe('User', () => {
  it('should get current user', async () => {
    await pactum
      .spec()
      .get('/v1/users/me')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict({
        id: string('$S{userId}'),
        username: string(),
        name: string(),
        role: 'user',
        email: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should edit user', async () => {
    await pactum
      .spec()
      .patch('/v1/users')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withBody(dto)
      .expectJsonMatchStrict({
        id: string('$S{userId}'),
        name: dto.name,
        username: dto.username,
        role: 'user',
        email: dto.email,
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should change role to admin', async () => {
    await pactum
      .spec()
      .patch('/v1/users/role')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withQueryParams('role', 'admin')
      .expectJsonMatchStrict({
        id: string('$S{userId}'),
        username: string(),
        email: string(),
        role: 'admin',
        name: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should change role to manager', async () => {
    await pactum
      .spec()
      .patch('/v1/users/role')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withQueryParams('role', 'manager')
      .expectJsonMatchStrict({
        id: string('$S{userId}'),
        username: string(),
        email: string(),
        role: 'manager',
        name: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should change role to user', async () => {
    await pactum
      .spec()
      .patch('/v1/users/role')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withQueryParams('role', 'user')
      .expectJsonMatchStrict({
        id: string('$S{userId}'),
        username: string(),
        email: string(),
        role: 'user',
        name: string(),
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should throw error when changing role to nonexistent role', async () => {
    await pactum
      .spec()
      .patch('/v1/users/role')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withQueryParams('role', 'other')
      .expectBody({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Improper Role',
        error: 'Bad Request',
      })
      .expectStatus(HttpStatus.BAD_REQUEST);
  });
});
