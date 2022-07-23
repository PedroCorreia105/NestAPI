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
  let roomId: JSONValue;
  let userId: JSONValue;

  group('Signup with new user', () => {
    const response = http.post(`${BASE_URL}/auth/signup`, {
      email: `${Math.random()}@nest.com`,
      name: `Name ${Math.random()}`,
      password: '123',
      username: `Username ${Math.random()}`,
    });

    if (
      check(response, {
        'request successful': (r) => r.status === 201,
        'obtained access token': () => !!response.json('accessToken'),
      })
    ) {
      ErrorRate.add(false);
      authToken = response.json('accessToken');
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);

      fail(`Unable to login ${response.status} ${response.body}`);
    }
  });

  group('Signup with user 2', () => {
    const response = http.post(`${BASE_URL}/auth/signup`, {
      email: `${Math.random()}@nest.com`,
      name: `Name ${Math.random()}`,
      password: '123',
      username: `Username ${Math.random()}`,
    });

    if (
      check(response, {
        'request successful': (r) => r.status === 201,
        'obtained access token': () => !!response.json('accessToken'),
      })
    ) {
      ErrorRate.add(false);
      userId = response.json('userId');
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);

      fail(`Unable to login ${response.status} ${response.body}`);
    }
  });

  group('Create room', () => {
    const payload = {
      title: `Room Title ${Math.random()}`,
      description: `Room Description ${Math.random()}`,
      link: `www.${Math.random()}.com`,
    };

    const response = http.post(`${BASE_URL}/rooms`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'room created correctly': () => response.status === 201,
        'title is correct': () => response.json('title') === payload.title,
        'description is correct': () =>
          response.json('description') === payload.description,
        'link is correct': () => response.json('link') === payload.link,
      })
    ) {
      roomId = response.json('id');
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to create a Room ${response.status} ${response.body}`);
    }
  });

  group('Edit room', () => {
    const payload = {
      title: `New Title ${Math.random()}`,
      description: `New Description ${Math.random()}`,
      link: `www.new${Math.random()}.com`,
    };

    const response = http.patch(`${BASE_URL}/rooms/${roomId}`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'update worked': () => response.status === 200,
        'updated title is correct': () => response.json('title') === payload.title,
        'updated description is correct': () =>
          response.json('description') === payload.description,
        'updated link is correct': () => response.json('link') === payload.link,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to update the room ${roomId}. ${response.status} ${response.body}`);
    }
  });

  group('Add user to room', () => {
    const response = http.post(
      `${BASE_URL}/rooms/${roomId}/user/${userId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (
      check(response, {
        'user added to room': () => response.status === 201,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(
        `Unable to add user ${userId} to the room ${roomId}. ${response.status} ${response.body}`,
      );
    }
  });

  group('Delete room', () => {
    const result = http.del(`${BASE_URL}/rooms/${roomId}`, null, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(null, {
        'room was deleted correctly': () => result.status === 204,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail('room was not deleted properly');
    }
  });

  group('Get no room', () => {
    const response = http.get(`${BASE_URL}/rooms/${roomId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'got no room': () => response.status === 404,
        'status code correct': () => response.json('statusCode') === 404,
        'error message is correct': () => response.json('message') === 'Room not Found',
        'error name is correct': () => response.json('error') === 'Not Found',
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to get the room ${roomId}. ${response.status} ${response.body}`);
    }
  });
};
