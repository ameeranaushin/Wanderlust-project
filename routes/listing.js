const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const Review = require("../models/review.js"); 
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const { listingSchema, reviewSchema } = require("../schema.js");
const { isLoggedIn, isOwner } = require("../middleware.js"); 
const axios = require("axios");

// Middleware: validate listing
const validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};

// Middleware: validate review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};

// Index - all listings
router.get("/", wrapAsync(async (req, res) => {
  const listings = await Listing.find({});
  res.render("listings/index", { listings });
}));

// New listing form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("listings/new");
});

// Show listing
router.get("/:id", wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Cannot find that listing!");
    return res.redirect("/listings");
  }

  res.render("listings/show", { listing });
}));

router.post("/", isLoggedIn, validateListing, wrapAsync(async (req, res) => {
  const location = req.body.listing.location;

  // Use Nominatim API to get coordinates
  const response = await axios.get("https://nominatim.openstreetmap.org/search", {
    params: { q: location, format: "json", limit: 1 },
    headers: { "User-Agent": "wanderlust-app" } // required by Nominatim
  });

  let coordinates = [0, 0]; // default in case location not found
  if (response.data.length > 0) {
    coordinates = [
      parseFloat(response.data[0].lon), // longitude
      parseFloat(response.data[0].lat)  // latitude
    ];
  }

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.geometry = { type: "Point", coordinates };

  await newListing.save();
  req.flash("success", "Successfully made a new listing!");
  res.redirect(`/listings/${newListing._id}`);
}));


// Show edit form
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Cannot find that listing!"); 
    return res.redirect("/listings");
  }

  res.render("listings/edit", { listing });
}));

// Update listing
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(async (req, res) => {
  const { id } = req.params;

  const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  req.flash("success", "Listing updated successfully!");
  res.redirect(`/listings/${id}`);
}));

// Delete listing
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(async (req, res) => {
  const { id } = req.params;
  
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) throw new ExpressError("Listing not found", 404);

  req.flash("success", "Successfully deleted listing!"); 
  res.redirect("/listings");
}));




module.exports = router;
