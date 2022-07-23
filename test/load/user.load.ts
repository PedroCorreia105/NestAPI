import http from 'k6/http';
import { check, group, JSONValue, fail } from 'k6';
import { Counter, Rate } from 'k6/metrics';
import { Options } from 'k6/options';

const BASE_URL = `${__ENV.BASE_URL}/v1`;
const ErrorCount = new Counter('errors');
const ErrorRate = new Rate('error_rate');

export const options: Options = {
  stages: [
    { duration: '15s', target: 50 },
    { duration: '30s', target: 50 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    checks: ['rate==1'],
    data_received: ['rate>80'],
    data_sent: ['rate>80'],
    http_req_duration: ['avg<600'],
    http_reqs: ['rate>60'],
    iteration_duration: ['avg<4000'],
    iterations: ['rate>9'],
    error_rate: ['rate==0'],
    errors: ['count==0'],
  },
};

export default () => {
  let authToken: JSONValue;
  let userId: JSONValue;
  const userPayload = {
    email: `${Math.random()}@user.com`,
    name: `Name ${Math.random()}`,
    password: '123',
    username: `User Username ${Math.random()}`,
  };

  group('Signup with new user', () => {
    const response = http.post(`${BASE_URL}/auth/signup`, userPayload);

    if (
      check(response, {
        'request successful': (r) => r.status === 201,
        'obtained access token': () => !!response.json('accessToken'),
        'obtained id': () => !!response.json('userId'),
      })
    ) {
      userId = response.json('userId');
      authToken = response.json('accessToken');
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);

      fail(`Unable to login ${response.status} ${response.body}`);
    }
  });

  group('Get user', () => {
    const response = http.get(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'request successful': () => response.status === 200,
        'name is correct': () => response.json('name') === userPayload.name,
        'username is correct': () => response.json('username') === userPayload.username,
        'email is correct': () => response.json('email') === userPayload.email,
        'id is correct': () => response.json('id') === userId,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to get self user ${response.status} ${response.body}`);
    }
  });

  group('Edit user', () => {
    const payload = {
      email: `${Math.random()}@new.com`,
      name: `New Name ${Math.random()}`,
      username: `New Username ${Math.random()}`,
    };

    const response = http.patch(`${BASE_URL}/users`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'request successful': () => response.status === 200,
        'updated name is correct': () => response.json('name') === payload.name,
        'updated email is correct': () => response.json('email') === payload.email,
        'updated username is correct': () =>
          response.json('username') === payload.username,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to update the user ${userId}. ${response.status} ${response.body}`);
    }
  });
};
