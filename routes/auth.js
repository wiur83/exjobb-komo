const router = require('express').Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { registerValidation, loginValidation } = require("../validation");
const verify = require("./verifyToken");

//REGISTRATION ROUTE
router.post("/register", async (req, res) => {
    //Validation
    const { error } = registerValidation(req.body);
    if (error) return res.json({ msg: error.details[0].message });

    //Check if email exist
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) return res.json({ msg: "email_exist" });

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //User creation
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    try {
      const savedUser = await user.save();
      res.send({ userId: user._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

//LOGIN ROUTE
router.post("/login", async (req, res) => {
    //Validation
    const { error } = loginValidation(req.body);
    if (error) return res.json({ msg: error.details[0].message });

    //Check if email exist
    const user = await User.findOne({email: req.body.email});
    if (!user) return res.json({ msg: 'wrong_email' });
    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if (!validPass) return res.json({ msg: 'wrong_password' });

    //Create and asign jwt-token
    const token = jwt.sign({_id: user._id}, process.env.TOKEN_SECRET);
    console.log("token-login");
    console.log(token);
    console.log("token-login");

    res.json({ msg: token });
});

//Token test POST
router.post("/talk-server", verify, async (req, res) => {
    res.json({ msg: req.user });
});

module.exports = router;
