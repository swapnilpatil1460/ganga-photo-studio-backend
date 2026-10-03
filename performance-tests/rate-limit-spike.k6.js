import http from 'k6/http';
import { check } from 'k6';
import { Counter, Rate } from 'k6/metrics';

const rateLimitedRequests = new Counter('rate_limited_429');
const successfulRequests = new Counter('successful_200');
const droppedConnections = new Counter('dropped_connections');

export const options = {
  // Spike test profile
  stages: [
    { duration: '10s', target: 500 }, // Extremely fast ramp-up to 500 VUs
    { duration: '20s', target: 500 }, // Hold 500 VUs to overwhelm proxy and rate limiter
    { duration: '10s', target: 0 },   // Fast ramp-down
  ],
  thresholds: {
    // SLOs
    // The express-rate-limit allows 300 req / 15 min globally or per IP.
    // If all VUs share an IP (or we exceed global limits), we expect many 429s.
    'http_req_failed': ['rate<0.99'], // Allow failures due to 429, but not 5xx
    'dropped_connections': ['count==0'], // Proxy (Render) should NOT drop connections (502/504)
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';

export default function () {
  // We hit a lightweight endpoint to isolate proxy/rate-limiting performance
  // rather than database performance.
  const res = http.get(`${BASE_URL}/auth/ping`);
  
  if (res.status === 200) {
    successfulRequests.add(1);
  } else if (res.status === 429) {
    rateLimitedRequests.add(1);
  } else if (res.status === 502 || res.status === 504 || res.error) {
    droppedConnections.add(1);
  }
  
  check(res, {
    'is 200 or 429': (r) => r.status === 200 || r.status === 429,
  });
}
