const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/customers',
  method: 'GET'
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const customers = JSON.parse(data);
    const cust = customers[0];
    
    // Create order
    const orderBody = JSON.stringify({
      customer: cust._id,
      service: 'Photography',
      quantity: 1,
      price: 1500,
      totalAmount: 1500,
      expectedDeliveryDate: '2026-10-10',
      priority: 'Normal',
      assignedEmployee: ''
    });
    
    const req2 = http.request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': orderBody.length
      }
    }, (res2) => {
      let data2 = '';
      res2.on('data', chunk => data2 += chunk);
      res2.on('end', () => {
        const order = JSON.parse(data2);
        console.log("Created Order:", order);
        
        // Fetch it
        http.get(`http://localhost:5000/api/orders/${order._id}`, (res3) => {
          let data3 = '';
          res3.on('data', chunk => data3 += chunk);
          res3.on('end', () => {
            console.log("Fetched Order:", JSON.parse(data3));
          });
        });
      });
    });
    req2.write(orderBody);
    req2.end();
  });
});
req.end();
