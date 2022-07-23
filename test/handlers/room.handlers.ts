import { handler } from 'pactum';
import { RoomDto } from '../../src/room/dto';
import { v4 as uuidv4 } from 'uuid';

handler.addSpecHandler('createRoom', (ctx) => {
  const { spec, data } = ctx;
  const room: RoomDto = {
    title: `Room Title ${uuidv4()}`,
    description: `Room Description ${uuidv4()}`,
    link: `www.${uuidv4()}.com`,
  };

  spec
    .post('/v1/rooms')
    .withHeaders({
      Authorization: `Bearer $S{accessToken-${data}}`,
    })
    .withBody(room)
    .stores('roomId', 'id');
});

handler.addSpecHandler('deleteRoom', (ctx) => {
  const { spec, data } = ctx;

  spec.delete('/v1/rooms/$S{roomId}').withHeaders({
    Authorization: `Bearer $S{accessToken-${data}}`,
  });
});
