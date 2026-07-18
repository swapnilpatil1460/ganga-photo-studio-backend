const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true }
});

const Model = mongoose.model('Test2', schema);

const doc = new Model({ title: 'test', type: 'wedding' });
console.log("Doc type:", doc.type);
