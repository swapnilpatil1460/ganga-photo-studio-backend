const https = require('https');

async function testApi() {
  try {
    // 1. Login to get token
    const loginRes = await fetch('https://ganga-photo-studio-backend.onrender.com/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'owner@ganga.com', password: 'owner123' })
    });
    const loginData = await loginRes.json();
    if (!loginData.token) {
      console.error('Login failed:', loginData);
      return;
    }
    
    // Create customer first
    const custRes = await fetch('https://ganga-photo-studio-backend.onrender.com/api/customers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${loginData.token}` },
      body: JSON.stringify({ name: 'Test Customer', phone: '1234567890', email: 'test@test.com' })
    });
    const custData = await custRes.json();
    console.log('Customer created:', custData._id);

    // Create order
    const orderBody = {
      customer: custData._id,
      service: 'Photography',
      quantity: 1,
      price: 100,
      totalAmount: 100,
      expectedDeliveryDate: '2026-12-31',
      priority: 'Normal',
      assignedEmployee: 'yash',
      paidAmount: 0
    };
    
    const ordRes = await fetch('https://ganga-photo-studio-backend.onrender.com/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${loginData.token}` },
      body: JSON.stringify(orderBody)
    });
    const ordData = await ordRes.json();
    console.log('Order created assignedEmployee:', ordData.assignedEmployee);

  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testApi();
