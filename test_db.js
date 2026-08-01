import mongoose from 'mongoose';

async function testConnection() {
  const uri = "mongodb+srv://srock:ZEfAWJcaGaiut2Zs@kalynakar.fqodmvs.mongodb.net/ganga-studio?retryWrites=true&w=majority";
  try {
    await mongoose.connect(uri);
    console.log("Success connecting with 'srock'!");
    process.exit(0);
  } catch (err) {
    console.log("Failed with 'srock':", err.message);
    
    try {
      const uri2 = "mongodb+srv://SRock:ZEfAWJcaGaiut2Zs@kalynakar.fqodmvs.mongodb.net/ganga-studio?retryWrites=true&w=majority";
      await mongoose.connect(uri2);
      console.log("Success connecting with 'SRock'!");
      process.exit(0);
    } catch(err2) {
      console.log("Failed with 'SRock':", err2.message);
      process.exit(1);
    }
  }
}

testConnection();
