const router = require('express').Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");
const verify = require("./verifyToken");

// // *************** databas grejor ****************
// const sqlite3 = require('sqlite3').verbose();
// const path = require('path')
// const dbPath = path.resolve("db", 'texts.sqlite')
// let db = new sqlite3.Database(dbPath, (err) => {
// 	if(err) {
// 		return console.log(err.message);
// 	}
// 	console.log("Connected to database!")
// });

const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the texts database.');
});


//REGISTRATION ROUTE
router.post("/register", async (req, res) => {
    console.log(req.body);
    console.log(req.body.email);
    //Validation
    const { error } = registerValidation(req.body);
    if (error) return res.json({ msg: "error", text: error.details[0].message });

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Random id creation
    let random_id = (Math.floor(Math.random() * 10000000000));
    console.log(random_id);

    //Check if email exist
    db.each("SELECT COUNT(*) AS total FROM users WHERE email = ?",
    req.body.email,(err, row) => {
        if (row.total == 1) {
            //Email exists
        	return res.json({ msg: "error", text: "Email already exists" });
        } else {
            //Email does not exists
            db.run("INSERT INTO users (name, email, password, backup_id) VALUES (?, ?, ?, ?)",
				req.body.name, req.body.email, hashedPassword, random_id, (err) => {
				if (err) {
					res.json({ msg: "error", text: "Something went wrong while writing to database." });
				} else {
                    res.json({ msg: "success" });
                }
		    });
        }
    });
});


//LOGIN ROUTE
router.post("/login", async (req, res) => {
    //Validation email and password
    const { error } = loginValidation(req.body);
    if (error) return res.json({ msg: "error", text: error.details[0].message });

    //Check if email exist
    db.each("SELECT * FROM users WHERE email = ?",
    req.body.email, async (err, row) => {
        if (err) {
            //Email does not exist
        	return res.json({ msg: "error", text: "Email does not exist?" });
        } else {
            //email exist
            //Check if password is correct
            const validPass = await bcrypt.compare(req.body.password, row.password);
            if (!validPass) return res.json({ msg: "error", text: "Wrong password!!" });
            //Create, asignand return jwt-token
            const token = jwt.sign({id: row.backup_id}, process.env.TOKEN_SECRET);
            res.json({ msg: "token", text: token });
        }
    });
});

//Token test POST
router.post("/talk-server", verify, async (req, res) => {
    res.json({ msg: req.user });
});

module.exports = router;
