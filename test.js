require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing'); // make sure path is correct

const MONGO_URL = process.env.MONGO_URL;

async function testDB() {
  try {
    await mongoose.connect(MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB Atlas");

    const listings = await Listing.find({});
    console.log(`Found ${listings.length} listings in DB`);
    if (listings.length > 0) {
      console.log("Sample listing:", listings[0]);
    }

    mongoose.connection.close();
    console.log("Connection closed");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
}

testDB();

