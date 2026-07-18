const http = require('http');

http.get('http://localhost:5000/api/orders', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const orders = JSON.parse(data);
    if (orders.length > 0) {
      const latestOrder = orders[0];
      console.log('Latest Order:', latestOrder);
      
      if (latestOrder.customer) {
        let custId = typeof latestOrder.customer === 'string' ? latestOrder.customer : latestOrder.customer._id;
        http.get(`http://localhost:5000/api/customers/${custId}`, (cRes) => {
          let cData = '';
          cRes.on('data', chunk => cData += chunk);
          cRes.on('end', () => {
            console.log('Customer fetch status:', cRes.statusCode);
            console.log('Customer data:', cData);
          });
        });
      }
    } else {
      console.log('No orders found');
    }
  });
});
