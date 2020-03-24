//Importing modules
const express = require('express');
const app = express();
const dotenv = require("dotenv");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');
const fetch = require("node-fetch");
//Importing routes
const authRoute = require("./routes/auth");
const verify = require("./routes/verifyToken");
//Variables
let globalToken = "";
const api_adress = "http://localhost:3000";
const port = 3000;


//CONFIGURATIONS
dotenv.config();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
//cors
app.use(cors());
// ejs
app.set('view engine', 'ejs');
// Set css middleware
app.use("/", express.static("assets"));

//connecting to db
mongoose.connect( process.env.DB_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true}, () =>
    console.log("connected to DB")
);

//Index GET
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//register GET
app.get("/register", (req, res) => {
    res.render("register.ejs");
});
//register POST
app.post("/register", async (req, res) => {
    try {
        await fetch(`${api_adress}/api/user/register`, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })
            }).then(function (response) {
                return response.json();
            })
            .then(function (result) {
                res.redirect('./login');
            })
    } catch(err) {
          console.log(err);
          res.status(400).send(err);
    }
});

app.get("/login", (req, res) => {
    res.render("login.ejs");
});
//login POST
app.post("/login", async (req, res) => {
    try {
        await fetch(`${api_adress}/api/user/login`, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
              email: req.body.email,
              password: req.body.password
            })
            }).then(function (response) {
                return response.json();
            })
            .then(function (result) {
                globalToken = result.msg;
                res.redirect('./talk');
            })
    } catch(err) {
          console.log(err);
          res.status(400).send(err);
    }
});

//logout GET
app.get("/logout", (req, res) => {
    globalToken = "";
    res.redirect('./login')
});


//Talk GET
app.get("/talk", async (req, res) => {
    const token = globalToken;

    try {
        await fetch(`${api_adress}/api/user/talk-server`, {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
              token: token
            })
            }).then(function (response) {
                return response.json();
            })
            .then(async function (result) {
                if (result.msg == "Access denied") {
                    res.render("error.ejs", {msg: "Access denied"});
                } else if (result.msg == "Invalid token") {
                    res.render("error.ejs", {msg: "Wrong email or password"});
                } else {
                    res.render("talk.ejs");
                }
            })
    } catch(err) {
          res.render("error.ejs", {msg: "Ops! Something went wrong. Try again."});
    }

});



//middleware
app.use(express.json());
//Route middleware
app.use("/api/user", authRoute);


app.listen(port, () => console.log(`the server is running on port ${port}`));
