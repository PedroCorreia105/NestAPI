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
  let reviewId: JSONValue;
  let shopId: JSONValue;
  let managerToken: JSONValue;

  group('Create manager', () => {
    const response = http.post(`${BASE_URL}/auth/signup`, {
      email: `${Math.random()}@nest.com`,
      name: `Name ${Math.random()}`,
      password: '123',
      username: `Username ${Math.random()}`,
    });

    managerToken = response.json('accessToken');
  });

  group('Create shop', () => {
    const response = http.post(
      `${BASE_URL}/shops`,
      {
        name: `Shop Name ${Math.random()}`,
        description: `Shop Description ${Math.random()}`,
        website: `www.${Math.random()}.com`,
      },
      {
        headers: {
          Authorization: `Bearer ${managerToken}`,
        },
      },
    );

    shopId = response.json('id');
  });

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

  group('Create review', () => {
    const payload = {
      title: `Review Title ${Math.random()}`,
      description: `Review Description ${Math.random()}`,
    };

    const response = http.post(`${BASE_URL}/shops/${shopId}/reviews`, payload, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'review created correctly': () => response.status === 201,
        'title is correct': () => response.json('title') === payload.title,
        'description is correct': () =>
          response.json('description') === payload.description,
      })
    ) {
      reviewId = response.json('id');
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(
        `Unable to create a review ${BASE_URL}/shops/${shopId}/reviews ${response.status} ${response.body}`,
      );
    }
  });

  group('Edit review', () => {
    const payload = {
      title: `Review Title ${Math.random()}`,
      description: `Review Description ${Math.random()}`,
    };

    const response = http.patch(`${BASE_URL}/reviews/${reviewId}`, payload, {
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
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(
        `Unable to update the review ${reviewId}. ${response.status} ${response.body}`,
      );
    }
  });

  group('Delete review', () => {
    const result = http.del(`${BASE_URL}/reviews/${reviewId}`, null, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(null, {
        'review was deleted correctly': () => result.status === 204,
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail('Review was not deleted properly');
    }
  });

  group('Get no review', () => {
    const response = http.get(`${BASE_URL}/reviews/${reviewId}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (
      check(response, {
        'got no reviews': () => response.status === 404,
        'status code correct': () => response.json('statusCode') === 404,
        'error message is correct': () => response.json('message') === 'Review not Found',
        'error name is correct': () => response.json('error') === 'Not Found',
      })
    ) {
      ErrorRate.add(false);
    } else {
      ErrorCount.add(1);
      ErrorRate.add(true);
      fail(`Error getting no review. ${response.status} ${response.body}`);
    }
  });
};
