"use strict";

//jshint esversion:6
require('dotenv').config();

var express = require("express");

var bodyParser = require("body-parser");

var ejs = require("ejs");

var mongoose = require("mongoose");

var session = require("express-session");

var passport = require("passport");

var passportLocalMongoose = require("passport-local-mongoose");

var app = express();
var port = 3000;
app.use(express["static"]("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
})); // initializare session

app.use(session({
  secret: 'Our little secret.',
  resave: false,
  saveUninitialized: false
})); // initializare si folosire a passport

app.use(passport.initialize());
app.use(passport.session()); //mongoose 

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true);
var userSchema = new mongoose.Schema({
  email: String,
  password: String
}); // initalizare passport-local-mongoose

userSchema.plugin(passportLocalMongoose); // modelu mongoose

var User = new mongoose.model("User", userSchema); // initializare si folosire a passport-local-mongoose

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.get("/secrets", function (req, res) {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.render("login");
  }
});
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
app.post("/register", function (req, res) {
  User.register({
    username: req.body.username
  }, req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.render("/register");
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});
app.post("/login", function (req, res) {
  var user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets");
      });
    }
  });
});
app.listen(port, function () {
  console.log("Server started on port " + port);
});