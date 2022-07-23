import { HttpStatus } from '@nestjs/common';
import { string } from 'pactum-matchers';
import * as pactum from 'pactum';

import { RoomDto } from '../../src/room/dto';

const roomDto: RoomDto = {
  title: 'My first room',
  description: 'Great Place',
  link: 'www.room.com',
};

describe('Rooms', () => {
  it('should create room', async () => {
    await pactum
      .spec('createRoom', 'user1')
      .expectJsonMatchStrict({
        id: string('$S{roomId}'),
        title: string(),
        description: string(),
        link: string(),
        users: [
          {
            id: string('$S{userId-user1}'),
            username: string(),
            email: string(),
            role: string(),
            name: string(),
          },
        ],
      })
      .expectStatus(HttpStatus.CREATED);
  });

  it('should throw error getting all rooms as non admin', async () => {
    await pactum
      .spec()
      .get('/v1/rooms')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectBody({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access to resources denied',
        error: 'Forbidden',
      })
      .expectStatus(HttpStatus.FORBIDDEN);
  });

  it('should get all rooms', async () => {
    await pactum
      .spec()
      .patch('/v1/users/role')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withQueryParams('role', 'admin')
      .expectStatus(HttpStatus.OK);

    await pactum
      .spec()
      .get('/v1/rooms')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict([
        {
          id: string('$S{roomId}'),
          title: string(),
          description: string(),
          link: string(),
          users: [
            {
              id: string('$S{userId-user1}'),
              username: string(),
              email: string(),
              role: string(),
              name: string(),
            },
          ],
        },
      ])
      .expectStatus(HttpStatus.OK);
  });

  it('should get user rooms', async () => {
    await pactum
      .spec()
      .get('/v1/rooms/user')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict([
        {
          id: string('$S{roomId}'),
          title: string(),
          description: string(),
          link: string(),
          users: [
            {
              id: string('$S{userId-user1}'),
              username: string(),
              email: string(),
              role: string(),
              name: string(),
            },
          ],
        },
      ])
      .expectStatus(HttpStatus.OK);
  });

  it('should get room by id', async () => {
    await pactum
      .spec()
      .get('/v1/rooms/$S{roomId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonMatchStrict({
        id: '$S{roomId}',
        title: string(),
        description: string(),
        link: string(),
        users: [
          {
            id: string('$S{userId-user1}'),
            username: string(),
            email: string(),
            role: string(),
            name: string(),
          },
        ],
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should edit room', async () => {
    await pactum
      .spec()
      .patch('/v1/rooms/$S{roomId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .withBody(roomDto)
      .expectJsonMatchStrict({
        id: '$S{roomId}',
        title: roomDto.title,
        description: roomDto.description,
        link: roomDto.link,
        users: [
          {
            id: string('$S{userId-user1}'),
            username: string(),
            email: string(),
            role: string(),
            name: string(),
          },
        ],
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should add user to room', async () => {
    await pactum
      .spec()
      .post('/v1/rooms/$S{roomId}/user/$S{userId-user2}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectStatus(HttpStatus.CREATED);
  });

  it('should throw error when adding to nonexistent room', async () => {
    await pactum
      .spec()
      .post('/v1/rooms/doesNotExist/user/$S{userId-user2}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Room not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when adding nonexistent user', async () => {
    await pactum
      .spec()
      .post('/v1/rooms/$S{roomId}/user/doesNotExist')
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

  it('should throw error if wrong user adds to room', async () => {
    await pactum
      .spec()
      .post('/v1/rooms/$S{roomId}/user/$S{userId-user3}')
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

  it('should throw error if wrong user edits room', async () => {
    await pactum
      .spec()
      .patch('/v1/rooms/$S{roomId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user2}',
      })
      .withBody(roomDto)
      .expectBody({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Access to resources denied',
        error: 'Forbidden',
      })
      .expectStatus(HttpStatus.FORBIDDEN);
  });

  it('should throw error if wrong user deletes room', async () => {
    await pactum
      .spec()
      .delete('/v1/rooms/$S{roomId}')
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

  it('should throw error when removing from nonexistent room', async () => {
    await pactum
      .spec()
      .delete('/v1/rooms/doesNotExist/user/$S{userId-user2}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Room not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when removing nonexistent user', async () => {
    await pactum
      .spec()
      .delete('/v1/rooms/$S{roomId}/user/doesNotExist')
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

  it('should throw error if wrong user removes from room', async () => {
    await pactum
      .spec()
      .delete('/v1/rooms/$S{roomId}/user/$S{userId-user1}')
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

  it('should remove user from room', async () => {
    await pactum
      .spec()
      .delete('/v1/rooms/$S{roomId}/user/$S{userId-user2}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectStatus(HttpStatus.OK);
  });

  it('should delete room', async () => {
    await pactum.spec('deleteRoom', 'user1').expectStatus(HttpStatus.NO_CONTENT);
  });

  it('should throw error when getting nonexistent room', async () => {
    await pactum
      .spec()
      .get('/v1/rooms/$S{roomId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Room not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when editing nonexistent room', async () => {
    await pactum
      .spec()
      .patch('/v1/rooms/$S{roomId}')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user2}',
      })
      .withBody(roomDto)
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Room not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should throw error when deleting nonexistent room', async () => {
    await pactum
      .spec('deleteRoom', 'user1')
      .expectBody({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Room not Found',
        error: 'Not Found',
      })
      .expectStatus(HttpStatus.NOT_FOUND);
  });

  it('should get empty rooms', async () => {
    await pactum
      .spec()
      .get('/v1/rooms/user')
      .withHeaders({
        Authorization: 'Bearer $S{accessToken-user1}',
      })
      .expectJsonLength(0)
      .expectStatus(HttpStatus.OK);
  });
});
