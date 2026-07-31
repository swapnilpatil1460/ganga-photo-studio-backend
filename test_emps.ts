import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const employeeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  status: { type: String }
}, { strict: false });

const Employee = mongoose.model('Employee', employeeSchema);

mongoose.connect(process.env.MONGODB_URI as string).then(async () => {
  const emps = await Employee.find({});
  console.log(JSON.stringify(emps.map(e => ({ name: e.name, status: e.status })), null, 2));
  process.exit(0);
}).catch(console.error);
