//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology:true})

const userSchema = {
    email:String,
    password:String
};


// modelu mongoose
const User = new mongoose.model("User",userSchema)

app.get("/", function(req,res){
    res.render("home")
})

app.get("/login", function(req, res){
    res.render("login")
})

app.get("/register",function(req,res){
    res.render("register")
})

app.post("/register", function(req,res){
    // prea info. transmise in register
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    })
    // salveaza info. in baza de date
    newUser.save(function(err){
        if(err){
            console.log(err);
        }else{
            res.render("secrets")
        }
    })
    
})


app.post("/login", function(req, res){
    // prea informatia trasmisa in capurile cu username si password
    const username = req.body.username;
    const password = req.body.password;

    // acestea verifica daca exista persoana cu username si password in baza de data
    User.findOne({email:username}, function(err,foundUser){
        if(err){
            console.log(err);
        }else{
            if(foundUser){
                if(foundUser.password === password){
                    res.render("secrets")
                }
            }
        }
    })
})


app.listen(port, function(){
    console.log("Server started on port "+port);
})