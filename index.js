//Importing modules
const express = require('express');
const app = express();
const dotenv = require("dotenv");
const bodyParser = require('body-parser');

//Importing controllers
const authRoute = require("./controllers/auth");
const voiceRoute = require("./controllers/voice");

//Config
dotenv.config();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Variables
const port = 3000;
global.globalToken = "";
global.userBackupId = "";
global.words = [];
global.userWords = [];
global.counterWords = 0;
global.currentWord = "";
global.currentResWords = [];
global.subWord = "";
global.result = "";





//Static files
app.use("/", express.static("assets"));

//Index GET
app.get("/", (req, res) => {
    res.render("index.ejs");
});

//logout GET
app.get("/logout", (req, res) => {
    global.globalToken = "";
    res.redirect('./login')
});




//middleware
app.use(express.json());
//Route middleware
app.use("/user", authRoute);
app.use("/voice", voiceRoute);

app.listen(port, () => console.log(`the server is running on port ${port}`));
