require('dotenv').config();

const express = require("express");
const { join } = require("path");
const { connect } = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressLayouts = require("express-ejs-layouts");

const listingRouter = require("./routes/listing.js"); // Router
const reviewRouter = require("./routes/review.js"); // Reviews router
const userRouter = require("./routes/user.js"); // Users router
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const app = express();

// Layouts
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");

app.set("view engine", "ejs");
app.set("views", join(__dirname, "views"));
app.engine("ejs", ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(join(__dirname, "public")));

// MongoDB
const MONGO_URL = process.env.DB_URL || "mongodb://localhost:27017/wanderlust"; // Use env variable
connect(MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ Error connecting to MongoDB", err));

// Session
const sessionOptions = {
  secret: process.env.SECRET || "mysecret", // Use env variable
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true
  }
};
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use("/listings", listingRouter); 
app.use("/listings/:listingId/reviews", reviewRouter); 
app.use("/", userRouter); 
app.get("/", (req, res) => {
  res.send("hi am rest");
});

// 404 Handler
app.all("*", (req, res, next) => {
  next(new ExpressError("Not Found", 404));
});

// Error Handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh no, something went wrong!";
  res.status(statusCode).render("error.ejs", { statusCode, message: err.message });
});

// Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
