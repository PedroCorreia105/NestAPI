import http from 'k6/http';
import { check, group, fail } from 'k6';
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
  const authPayload = {
    email: `${Math.random()}@auth.com`,
    name: `Name ${Math.random()}`,
    password: '123',
    username: `Auth Username ${Math.random()}`,
  };

  group('Signup with new user', () => {
    const response = http.post(`${BASE_URL}/auth/signup`, authPayload);

    if (
      check(response, {
        'request successful': (r) => r.status === 201,
        'obtained access token': () => !!response.json('accessToken'),
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);

      fail(`Unable to login ${response.status} ${response.body}`);
    }
  });

  group('Signin with user', () => {
    const response = http.post(`${BASE_URL}/auth/signin`, authPayload);

    if (
      check(response, {
        'request successful': (r) => r.status === 200,
        'obtained access token': () => !!response.json('accessToken'),
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);

      fail(`Unable to login ${response.status} ${response.body}`);
    }
  });
};
