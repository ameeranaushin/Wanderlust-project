const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const ExpressError = require("../utils/ExpressError");
const Review = require("../models/review.js"); 
const { reviewSchema } = require("../schema.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isOwner,isReviewAuthor } = require("../middleware.js"); 

// Middleware: validate review
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body); // flat now
  if (error) {
    const errMsg = error.details.map(el => el.message).join(",");
    throw new ExpressError(errMsg, 400);
  } else {
    next();
  }
};

// Create review
router.post("/", isLoggedIn, validateReview, wrapAsync(async (req, res) => {
  const { rating, comment } = req.body; 
  const listing = await Listing.findById(req.params.listingId);

  if (!listing) throw new ExpressError("Listing not found", 404);

  const newReview = new Review({ rating, comment, author: req.user._id });
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Successfully added review!");
  res.redirect(`/listings/${listing._id}`);
}));

// Delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(async (req, res) => {
  const { listingId, reviewId } = req.params;

  await Listing.findByIdAndUpdate(listingId, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Successfully deleted review!");
  res.redirect(`/listings/${listingId}`);
}));

module.exports = router;
