//Importing modules
const express = require('express');
const app = express();
const dotenv = require("dotenv");
// const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors');
const fetch = require("node-fetch");
//Importing routes
const authRoute = require("./routes/auth");

const verify = require("./routes/verifyToken");
//Variables
global.globalToken = "";
global.userBackupId = "";
global.words = [];
global.userWords = [];
global.counterWords = 0;
global.currentWord = "";
global.currentResWords = [];
global.subWord = "";
global.result = "";


const api_adress = "http://localhost:3000";
const port = 3000;

//TEst class
const Voice = require('./model/Voice');
const VoiceMethods = require('./model/Voice');



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
                if (result.msg == "error") {
                    res.render("error.ejs", { msg: result.text });
                } else if (result.msg == "success") {
                    res.redirect('./login');
                } else {
                    res.render("error.ejs", { msg: "Something went wrong" });
                }
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
            .then(async function (result) {
                if (result.msg == "error") {
                    res.render("error.ejs", { msg: result.text });
                } else if (result.msg == "token") {
                    globalToken = result.text;
                    userBackupId = result.backup_id;
                    global.words = await VoiceMethods.getWords();
                    await VoiceMethods.setUserWords();
                    global.userWords = await VoiceMethods.getUserWords();


                    global.counterWords = await VoiceMethods.getCounterWords();

                    global.startCounter = 0;
                    global.score = 0;
                    res.redirect('./talk-login');
                } else {
                    res.render("error.ejs", { msg: "Something went wrong" });
                }

            })
    } catch(err) {
          console.log(err);
          res.render("error.ejs", {msg: "Ops! Something went wrong. Try again."});
    }
});

//Talk GET
app.get("/restart", verify, async (req, res) => {
    global.words = await VoiceMethods.getWords();
    await VoiceMethods.setUserWords();
    global.userWords = await VoiceMethods.getUserWords();
    global.counterWords = await VoiceMethods.getCounterWords();
    global.startCounter = 0;
    global.score = 0;
    res.redirect('./talk-login');
});


//Talk GET
app.get("/talk-login", verify, async (req, res) => {
    if (req.user == "Access denied") {
        res.render("error.ejs", {msg: "Please login"});
    } else if (req.user == "Invalid token") {
        res.render("error.ejs", {msg: "Wrong email or password"});
    } else {

        //Set the current word + res_word
        global.currentWord = Object.keys(global.userWords)[global.startCounter];
        global.currentResWords = global.userWords[global.currentWord];


        if (global.counterWords > global.startCounter) {
            res.render("talk.ejs", {msg: Object.keys(global.userWords)[global.startCounter]});
        } else {
            // Lägg till resultatet i statestik
            await VoiceMethods.addToStatistics();
            res.render("finished.ejs", {score: global.score, total: global.counterWords});
        }

    }
});

//logout GET
app.post("/submit", async (req, res) => {
    global.startCounter = global.startCounter + 1;
    var checkIfWordExist = global.currentResWords.includes(req.body.value);
    global.subWord = req.body.value;
    if (checkIfWordExist == true) {
        // word exist
        global.result = "Sucess";
        //Add +1 to Nr_of_tries
        await VoiceMethods.addToNrOfTries();
        //Add point to score
        global.score = global.score + 1;
        //Change global.result to SUCCESS

    } else {
        // word does not exist
        global.result = "Fail";

        //Add word and resword
        await VoiceMethods.addResWord();


    }
});

//logout GET
app.get("/submit", async (req, res) => {
    res.render("result.ejs", {msg: global.result});
});


















//logout GET
app.get("/logout", (req, res) => {
    globalToken = "";
    res.redirect('./login')
});



//logout GET
app.get("/error", (req, res) => {
    res.render("talk.ejs", {msg: "error"});
});


//middleware
app.use(express.json());
//Route middleware
app.use("/api/user", authRoute);


app.listen(port, () => console.log(`the server is running on port ${port}`));
