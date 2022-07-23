import { handler } from 'pactum';
import { AuthDto } from '../../src/auth/dto';
import { v4 as uuidv4 } from 'uuid';

handler.addSpecHandler('createUser', (ctx) => {
  const { spec, data } = ctx;
  const user: AuthDto = {
    email: `${uuidv4()}@nest.com`,
    name: `Name ${uuidv4()}`,
    password: '123',
    username: `Username ${uuidv4()}`,
  };

  spec
    .post('/v1/auth/signup')
    .withBody(user)
    .stores(`accessToken-${data}`, 'accessToken')
    .stores(`userId-${data}`, 'userId');
});
