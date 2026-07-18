const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/photo-studio')
  .then(async () => {
    const db = mongoose.connection.useDb('photo-studio');
    const orders = await db.collection('orders').find({}).toArray();
    console.log('ALL ORDERS:');
    orders.forEach(o => console.log(`- ${o.orderId} | Status: ${o.status}`));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
