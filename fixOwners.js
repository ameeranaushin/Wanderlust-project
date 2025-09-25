require("dotenv").config();
const mongoose = require("mongoose");
const Listing = require("./models/listing");
const Review = require("./models/review");
const User = require("./models/user");

const MONGO_URL = process.env.MONGO_URL;

async function fixOwners() {
  await mongoose.connect(MONGO_URL, {});

  console.log("✅ Connected to MongoDB");

  // Default user (you can pick an actual user from DB)
  let defaultUser = await User.findOne();
  if (!defaultUser) {
    console.log("❌ No users found in DB. Create a user first!");
    process.exit();
  }

  // Fix Listings
  const listings = await Listing.find({});
  for (let listing of listings) {
    if (!listing.owner) {
      listing.owner = defaultUser._id;
      await listing.save();
      console.log(`Fixed owner for listing: ${listing.title}`);
    }
  }

  // Fix Reviews
  const reviews = await Review.find({});
  for (let review of reviews) {
    if (!review.author) {
      review.author = defaultUser._id;
      await review.save();
      console.log(`Fixed author for review ID: ${review._id}`);
    }
  }

  console.log("✅ Finished fixing owners/authors");
  mongoose.connection.close();
}

fixOwners().catch((err) => {
  console.error(err);
  mongoose.connection.close();
});
