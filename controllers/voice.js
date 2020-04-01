const express = require('express');
const router = require('express').Router();
const verify = require("../models/verifyToken");
const VoiceMethods = require('../models/Voice');





//Static files
router.use("/", express.static("assets"));

//login GET
router.get("/start", async (req, res) => {
    //All words(incl. the wrong ones) are stored in memory
    global.userWords = await VoiceMethods.getUserWords();

    //Counter for the words sent to test
    global.counterWords = await VoiceMethods.getCounterWords();

    //Resetting start (word)counter to 0
    global.startCounter = await VoiceMethods.resetStartCounter();

    //Resetting start score to 0
    global.score = await VoiceMethods.resetScore();

    //Renders start with info about test
    res.render("../views/start.ejs");
});
//login POST
router.post("/start", (req, res) => {
    res.redirect('./talk-login');
});

//talk-login GET
router.get("/talk-login", verify, async (req, res) => {
    //Verifies(verify middleware) that user logged in.
    if (req.user == "Access denied") {
        res.render("../views/error.ejs", {msg: "Please login"});
    } else if (req.user == "Invalid token") {
        res.render("../views/error.ejs", {msg: "Wrong email or password"});
    } else {
        //Sets the current word that is sent to user
        global.currentWord = Object.keys(global.userWords)[global.startCounter];
        //Sets the current res_words that is used to compare if correct(success)
        global.currentResWords = global.userWords[global.currentWord];

        //Check if test if finished or not
        if (global.counterWords > global.startCounter) {
            res.render("../views/talk.ejs", {msg: Object.keys(global.userWords)[global.startCounter]});
        } else {
            // Adds score to statistics in DB
            await VoiceMethods.addToStatistics();
            res.render("../views/finished.ejs", {score: global.score, total: global.counterWords});
        }

    }
});


//submit POST
router.post("/submit", async (req, res) => {
    //Adds one(1) to startCounter
    global.startCounter = global.startCounter + 1;
    //Sets submitted word to memory(so addToNrOfTries can run correctly)
    global.subWord = req.body.value.toLowerCase();


    //Checks if word exists under res_word for current word
    let checkIfWordExist = global.currentResWords.includes(global.subWord);

    if (checkIfWordExist == true) {
        // word exist
        // global.result = "rätt";
        await VoiceMethods.addToNrOfTries();
        global.score = global.score + 1;
        res.redirect('./talk-login');
    } else {
        // word does not exist

        // Check that no clash with other word
        let checkNoClash = global.words.includes(global.subWord);

        if (checkNoClash == true) {
            //Clash. Word not added to res_word
            // global.result = "fel";
            res.redirect('./talk-login');
        } else {
            //No clash. Word added to res_word
            // global.result = "fel";
            await VoiceMethods.addResWord();
            res.redirect('./talk-login');
        }
    }
});

//submit GET
router.get("/submit", async (req, res) => {
    res.render("../views/result.ejs", {msg: global.result, result: global.subWord});
});


//restart GET
router.get("/restart", verify, async (req, res) => {
    //Resets all memory variables and loads in all words (incl new res_words)
    global.words = await VoiceMethods.getWords();
    await VoiceMethods.setUserWords();
    global.userWords = await VoiceMethods.getUserWords();
    global.counterWords = await VoiceMethods.getCounterWords();
    global.startCounter = 0;
    global.score = 0;
    res.redirect('./talk-login');
});


module.exports = router;
