import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

const aggregationLatency = new Trend('aggregation_duration');
const errorRate = new Rate('aggregation_error_rate');

export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 VUs
    { duration: '3m', target: 100 }, // Hold steady at 100 VUs
    { duration: '1m', target: 0 },   // Ramp down to 0 VUs
  ],
  thresholds: {
    // SLO: 95% of dashboard aggregation requests should finish in < 800ms
    'aggregation_duration': ['p(95)<800'],
    'aggregation_error_rate': ['rate<0.01'], 
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';
const TOKEN = __ENV.TOKEN || 'MOCK_TOKEN';

export function setup() {
  // Setup runs once before the test starts.
  // In a real environment, you would call a data generation script here,
  // or verify that the 50,000 mock records exist.
  console.log('Ensure MongoDB Atlas (M0) is seeded with 50,000 mock records before running.');
}

export default function () {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  // Targeting the endpoints that aggregate monthly revenue, schedules, and salaries
  const endpoints = [
    '/dashboard/owner',
    '/orders/analytics',
    '/salary?month=2026-10'
  ];

  const randomEndpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  
  const res = http.get(`${BASE_URL}${randomEndpoint}`, params);
  
  check(res, {
    'status is 200': (r) => r.status === 200,
    'latency < 1000ms': (r) => r.timings.duration < 1000,
  });

  aggregationLatency.add(res.timings.duration);
  errorRate.add(res.status >= 400);

  // Think time between dashboard refreshes
  sleep(Math.random() * 3 + 1); // 1-4 seconds
}
