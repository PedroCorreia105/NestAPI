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
  let shopId: JSONValue;

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

  group('Create shop', () => {
    const payload = {
      name: `Shop Name ${Math.random()}`,
      description: `Shop Description ${Math.random()}`,
      website: `www.${Math.random()}.com`,
    };

    const response = http.post(`${BASE_URL}/shops`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'shop created correctly': () => response.status === 201,
        'name is correct': () => response.json('name') === payload.name,
        'description is correct': () =>
          response.json('description') === payload.description,
        'website is correct': () => response.json('website') === payload.website,
      })
    ) {
      shopId = response.json('id');
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to create a Shop ${response.status} ${response.body}`);
    }
  });

  group('Edit shop', () => {
    const payload = {
      name: `Shop Name ${Math.random()}`,
      description: `Shop Description ${Math.random()}`,
      website: `www.${Math.random()}.com`,
    };

    const response = http.patch(`${BASE_URL}/shops/${shopId}`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'update worked': () => response.status === 200,
        'updated name is correct': () => response.json('name') === payload.name,
        'updated description is correct': () =>
          response.json('description') === payload.description,
        'updated website is correct': () => response.json('website') === payload.website,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to update the shop ${shopId}. ${response.status} ${response.body}`);
    }
  });

  group('Delete shop', () => {
    const result = http.del(`${BASE_URL}/shops/${shopId}`, null, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(null, {
        'shop was deleted correctly': () => result.status === 204,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail('Shop was not deleted properly');
    }
  });

  group('Get no shop', () => {
    const response = http.get(`${BASE_URL}/shops/${shopId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'got no shop': () => response.status === 404,
        'status code correct': () => response.json('statusCode') === 404,
        'error message is correct': () => response.json('message') === 'Shop not Found',
        'error name is correct': () => response.json('error') === 'Not Found',
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Unable to get the shop ${shopId}. ${response.status} ${response.body}`);
    }
  });
};
