//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session")
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');


const app = express();
const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

// initializare session
app.use(session({
    secret: 'Our little secret.',
    resave: false,
    saveUninitialized: false

}))

// initializare si folosire a passport
app.use(passport.initialize());
app.use(passport.session());

//mongoose 
mongoose.connect("mongodb+srv://Admin-Marius:parola1234@cluster0.q8iwr.gcp.mongodb.net/userDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
mongoose.set("useCreateIndex", true)

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    secret: String
});

// initalizare passport-local-mongoose
userSchema.plugin(passportLocalMongoose);
// initializare mongoose-findorcreate
userSchema.plugin(findOrCreate)

// modelu mongoose
const User = new mongoose.model("User", userSchema)

// initializare si folosire a passport-local-mongoose
passport.use(User.createStrategy());

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

//autentificare cu google, settings 
passport.use(new GoogleStrategy({
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/google/secrets"
    },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile);
        User.findOrCreate({
            googleId: profile.id
        }, function (err, user) {
            return cb(err, user);
        });
    }
));

// render home page
app.get("/", function (req, res) {
    res.render("home")
})

// login with google
app.get("/auth/google",
    passport.authenticate('google', {
        scope: ['profile']
    }));

app.get("/auth/google/secrets",
    passport.authenticate('google', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        // Successful authentication, redirect  to secrets.
        res.redirect('/secrets');
    });


// render login page
app.get("/login", function (req, res) {
    res.render("login")
})

// rander register page
app.get("/register", function (req, res) {
    res.render("register")
})

// reander secrets page if user is loggin in
app.get("/secrets", function (req, res) {
    User.find({
        "secret": {
            $ne: null
        }
    }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                res.render("secrets", {
                    userWithSecrets: foundUser
                })
            }
        }
    })
})


// if the user is logged in he will render the submit page
//  if he does not render the login page
app.get("/submit", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("submit")
    } else {
        res.render("login")
    }
})

app.post("/submit", function (req, res) {
    // submit text
    const submittedSecret = req.body.secret;

    // user 
    console.log(req.user.id);

    // check if the user is logged in, if logged in he will post the message on secrets
    User.findById(req.user.id, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                foundUser.secret = submittedSecret;
                foundUser.save(function () {
                    res.redirect("/secrets")
                })
            }
        }
    })
})
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
})

// registration form
app.post("/register", function (req, res) {

    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.render("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })



})


// retrieves username and password to be authenticated
app.post("/login", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password
    })

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })




})


app.listen(port, function () {
    console.log("Server started on port " + port);
})