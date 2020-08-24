"use strict";

//jshint esversion:6
require('dotenv').config();

var express = require("express");

var bodyParser = require("body-parser");

var ejs = require("ejs");

var mongoose = require("mongoose");

var md5 = require("md5");

var app = express();
var port = 3000;
app.use(express["static"]("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
var userSchema = new mongoose.Schema({
  email: String,
  password: String
}); // modelu mongoose

var User = new mongoose.model("User", userSchema);
app.get("/", function (req, res) {
  res.render("home");
});
app.get("/login", function (req, res) {
  res.render("login");
});
app.get("/register", function (req, res) {
  res.render("register");
});
app.post("/register", function (req, res) {
  // prea info. transmise in register
  var newUser = new User({
    email: req.body.username,
    password: md5(req.body.password)
  }); // salveaza info. in baza de date

  newUser.save(function (err) {
    if (err) {
      console.log(err);
    } else {
      res.render("secrets");
    }
  });
});
app.post("/login", function (req, res) {
  // prea informatia trasmisa in capurile cu username si password
  var username = req.body.username;
  var password = md5(req.body.password); // acestea verifica daca exista persoana cu username si password in baza de data

  User.findOne({
    email: username
  }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        if (foundUser.password === password) {
          res.render("secrets");
        }
      }
    }
  });
});
app.listen(port, function () {
  console.log("Server started on port " + port);
});