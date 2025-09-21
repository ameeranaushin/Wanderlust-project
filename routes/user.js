const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const {saveRedirectUrl}= require("../middleware.js");
router.get("/signup", (req, res) => {
  res.render("users/signup");
});

router.post("/signup", async (req, res) => {
    try {
        let { email, username, password } = req.body;
        const newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        console.log(registeredUser);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }

                
            req.flash("success","Welcome to Wanderlust");
            return res.redirect("/listings");
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Something went wrong. Please try again.");
        return res.redirect("/signup");
    }
});

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  saveRedirectUrl,
  passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
  (req, res) => {
    req.flash("success", "Welcome back to Wanderlust!");

    const redirectUrl = res.locals.redirectUrl || "/listings";
    delete req.session.redirectUrl; // ✅ clear it so it doesn't loop forever
    res.redirect(redirectUrl);
  }
);



router.get("/logout", (req, res) => {
    req.logout(err => {
        if (err) {
            console.error(err);
            req.flash("error", "Something went wrong. Please try again.");
            return res.redirect("/listings");
        }
        req.flash("success", "Goodbye!");
        res.redirect("/login");
    });
});

module.exports = router;