const express = require('express');
const router = require('express').Router();
const verify = require("../models/verifyToken");
const VoiceMethods = require('../models/Voice');





//Static files
router.use("/", express.static("assets"));

//login GET
router.get("/start", async (req, res) => {
    //tom
    global.userWords = await VoiceMethods.getUserWords();
    global.counterWords = await VoiceMethods.getCounterWords();
    global.startCounter = await VoiceMethods.resetStartCounter();
    global.score = await VoiceMethods.resetScore();
    res.render("../views/start.ejs");
});
//login POST
router.post("/start", (req, res) => {
    res.redirect('./talk-login');
});

//talk-login GET
router.get("/talk-login", verify, async (req, res) => {
    if (req.user == "Access denied") {
        res.render("../views/error.ejs", {msg: "Please login"});
    } else if (req.user == "Invalid token") {
        res.render("../views/error.ejs", {msg: "Wrong email or password"});
    } else {
        //Set the current word + res_word
        global.currentWord = Object.keys(global.userWords)[global.startCounter];
        global.currentResWords = global.userWords[global.currentWord];



        if (global.counterWords > global.startCounter) {
            res.render("../views/talk.ejs", {msg: Object.keys(global.userWords)[global.startCounter]});
        } else {
            // Lägg till resultatet i statestik
            await VoiceMethods.addToStatistics();
            res.render("../views/finished.ejs", {score: global.score, total: global.counterWords});
        }

    }
});


//submit GET
router.get("/submit", async (req, res) => {
    res.render("../views/result.ejs", {msg: global.result});
});

//submit POST
router.post("/submit", async (req, res) => {
    global.startCounter = global.startCounter + 1;
    var checkIfWordExist = global.currentResWords.includes(req.body.value);
    global.subWord = req.body.value;
    if (checkIfWordExist == true) {
        // word exist
        global.result = "Success";
        await VoiceMethods.addToNrOfTries();
        global.score = global.score + 1;


    } else {
        // word does not exist
        global.result = "Fail";
        await VoiceMethods.addResWord();
    }
});


//restart GET
router.get("/restart", verify, async (req, res) => {
    global.words = await VoiceMethods.getWords();
    await VoiceMethods.setUserWords();
    global.userWords = await VoiceMethods.getUserWords();
    global.counterWords = await VoiceMethods.getCounterWords();
    global.startCounter = 0;
    global.score = 0;
    res.redirect('./talk-login');
});


module.exports = router;
