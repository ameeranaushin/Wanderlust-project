const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  image: {
    filename: { type: String, default: "listingimage" },
    url: {
      type: String,
      required: true,
      default: "https://unsplash.com/photos/buildings-stand-tall-overlooking-the-coast-5u3VUnUWk84",
      set: (v) =>
        v === ""
          ? "https://unsplash.com/photos/buildings-stand-tall-overlooking-the-coast-5u3VUnUWk84"
          : v
    }
  },

  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },

  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  owner: { type: Schema.Types.ObjectId, ref: "User" },

  // ✅ geometry should be inside the schema object
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  }
});

// Middleware: delete reviews when listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;

