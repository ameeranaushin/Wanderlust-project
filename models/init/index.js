const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../listing.js");

const MONGO_URL = "mongodb://localhost:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to MongoDB");
    return initDB();
  })
  .catch(err => {
    console.error("Error connecting to MongoDB", err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({});

  const userId = "68ba7433e258cb56ae203038"; // 👈 must be an actual User _id

  const dataWithOwner = initdata.data.map(obj => ({
    ...obj,
    owner: userId
  }));

  await Listing.insertMany(dataWithOwner);
  console.log("Database initialized with owner field");
};
