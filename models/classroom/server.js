const express = require('express');
const app = express();

const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');

const sessionOptions = {
    secret: "mysupersecretstring",   // change in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false,               // true in production (with HTTPS)
        maxAge: 1000 * 60 * 60 * 24  // 1 day
    }
};

app.use(session(sessionOptions));
app.use(flash());

// Make flash messages available to all views
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "viewss"));

app.get("/register", (req, res) => {
    let { name = "anonymous" } = req.query;
    req.session.name = name;

    req.flash("success", "User registered successfully!");
    res.redirect("/hello");  // redirect so flash works properly
});

app.get("/test", (req, res) => {
    req.session.user = { id: 1, name: "John Doe" };
    res.send("Session initialized");
});

app.get("/hello", (req, res) => {
    res.render("page.ejs", { name: req.session.name });
});

app.get("/check", (req, res) => {
    if (req.session.user) {
        res.send(`User logged in: ${req.session.user.name}`);
    } else if (req.session.name) {
        res.send(`Session name found: ${req.session.name}`);
    } else {
        res.send("No session found");
    }
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
