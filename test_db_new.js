import mongoose from 'mongoose';

async function testConnection() {
  const uri = "mongodb+srv://srock:ShlKzUV7VsdQwv8v@kalynakar.fqodmvs.mongodb.net/ganga-studio?retryWrites=true&w=majority";
  try {
    await mongoose.connect(uri);
    console.log("Success connecting with 'srock'!");
    process.exit(0);
  } catch (err) {
    console.log("Failed with 'srock':", err.message);
    process.exit(1);
  }
}

testConnection();
