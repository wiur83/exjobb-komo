const router = require('express').Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");
const verify = require("./verifyToken");
const sqlite3 = require('sqlite3').verbose();

//DB connect
let db = new sqlite3.Database('./db/texts.sqlite', (err) => {
  if (err) {
    console.error(err.message);
  }
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
    let random_id = (Math.floor(Math.random() * 1000000000000));
    // console.log(random_id);

    //Check if email exist
    db.each("SELECT COUNT(*) AS total FROM users WHERE email LIKE ?",
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
    db.each("SELECT COUNT(*) AS total FROM users WHERE email LIKE ?",
    req.body.email, async (err, row) => {
        if (row.total == 0) {
            //Email not exists
            res.json({ msg: "error", text: "Email not found" });
        } else {
            //email exist
            db.each("SELECT * FROM users WHERE email LIKE ?",
            req.body.email, async (err, row) => {
                if (err) {
                    //Err
                	return res.json({ msg: "error", text: "Something went wrong" });
                } else {
                    //Check if password is correct
                    const validPass = await bcrypt.compare(req.body.password, row.password);
                    if (!validPass) return res.json({ msg: "error", text: "Wrong password!!" });
                    //Create, asignand return jwt-token
                    const token = jwt.sign({id: row.backup_id}, process.env.TOKEN_SECRET);
        

                    res.json({ msg: "token", text: token, backup_id: row.backup_id });
                }
            });
        }
    });
});

//Talk POST
router.post("/talk-server", verify, async (req, res) => {
    res.json({ msg: req.user });
});

module.exports = router;
