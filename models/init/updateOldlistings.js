const mongoose = require("mongoose");
const Listing = require("../listing"); 

const axios = require("axios");

mongoose.connect("mongodb://localhost:27017/wanderlust")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

async function updateListings() {
  const listings = await Listing.find({ geometry: { $exists: false } });
  for (let listing of listings) {
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: { q: listing.location, format: "json", limit: 1 },
        headers: { "User-Agent": "wanderlust-app" }
      });

      if (res.data.length > 0) {
        listing.geometry = {
          type: "Point",
          coordinates: [parseFloat(res.data[0].lon), parseFloat(res.data[0].lat)]
        };
        await listing.save();
        console.log(`Updated ${listing.title}`);
      } else {
        console.log(`No coordinates found for ${listing.title}`);
      }
    } catch (e) {
      console.log(e);
    }
  }
  mongoose.connection.close();
}

updateListings();
