import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate } from 'k6/metrics';

// Custom metrics to track latency during normal vs backup phases
const standardLatency = new Trend('standard_api_duration');
const backupLatency = new Trend('backup_api_duration');
const errorRate = new Rate('error_rate');

export const options = {
  scenarios: {
    // Scenario A: Steady baseline traffic (VUs creating orders)
    steady_api_traffic: {
      executor: 'constant-vus',
      vus: 50,
      duration: '3m',
      exec: 'createOrder',
    },
    // Scenario B: CPU-Intensive Backup Job triggered at the 1-minute mark
    trigger_backup_job: {
      executor: 'shared-iterations',
      vus: 1,
      iterations: 1,
      startTime: '1m', 
      exec: 'triggerBackup',
    },
  },
  thresholds: {
    // SLOs
    'standard_api_duration': ['p(95)<500'], // Normal traffic < 500ms
    'backup_api_duration': ['p(95)<2000'],  // Traffic during backup < 2s
    'error_rate': ['rate<0.01'],            // < 1% error rate
  },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:5000/api';
// Provide a valid owner token via environment variable `k6 run -e TOKEN=...`
const TOKEN = __ENV.TOKEN || 'MOCK_TOKEN'; 

export function createOrder() {
  const payload = JSON.stringify({
    customer: '64a7c8f90b1e2d3c4d5e6f7a', // Replace with a valid Customer ObjectId
    service: 'Wedding Photography',
    quantity: 1,
    price: 15000,
    totalAmount: 15000,
    assignedEmployee: 'Alice Photographer',
    expectedDeliveryDate: new Date(Date.now() + 7*24*60*60*1000).toISOString(),
    status: 'Received',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
  };

  const res = http.post(`${BASE_URL}/orders`, payload, params);
  
  check(res, {
    'order created successfully (201)': (r) => r.status === 201,
  });

  errorRate.add(res.status >= 400);

  // We tag requests that happen after 1 minute (during backup) vs before
  // (In a real advanced k6 setup we use execution context, but timing is a proxy here)
  if (__ENV.IS_BACKUP_PHASE === 'true') {
    backupLatency.add(res.timings.duration);
  } else {
    standardLatency.add(res.timings.duration);
  }

  sleep(1); // Pace the steady traffic
}

export function triggerBackup() {
  const params = {
    headers: { 'Authorization': `Bearer ${TOKEN}` },
    timeout: '120s', // Backup can take a long time to respond
  };
  
  console.log('🚀 Triggering AES-256-GCM / Drive Backup process...');
  // Signal to the steady traffic that the backup phase has started
  __ENV.IS_BACKUP_PHASE = 'true';

  const res = http.post(`${BASE_URL}/backup/run`, null, params);
  
  check(res, {
    'backup completed successfully (200)': (r) => r.status === 200,
  });
  
  console.log(`✅ Backup finished in ${res.timings.duration}ms`);
  __ENV.IS_BACKUP_PHASE = 'false';
}
