require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing');

const LOCAL_URL = "mongodb://localhost:27017/wanderlust";
const ATLAS_URL = process.env.MONGO_URL;

async function pushFromLocalToAtlas() {
  try {
    // Connect to local DB
    const localConn = await mongoose.createConnection(LOCAL_URL);
    const LocalListing = localConn.model('Listing', Listing.schema);
    const allListings = await LocalListing.find({});
    console.log(`Found ${allListings.length} listings locally.`);

    // Connect to Atlas
    const atlasConn = await mongoose.createConnection(ATLAS_URL);
    const AtlasListing = atlasConn.model('Listing', Listing.schema);

    // Push listings to Atlas
    for (let listing of allListings) {
      const exists = await AtlasListing.findOne({ title: listing.title });
      if (!exists) {
        await AtlasListing.create(listing.toObject());
        console.log(`Added: ${listing.title}`);
      }
    }

    console.log("All listings pushed to Atlas!");
    await localConn.close();
    await atlasConn.close();
  } catch (err) {
    console.error(err);
  }
}

pushFromLocalToAtlas();
