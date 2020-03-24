const router = require('express').Router();
const verify = require("./verifyToken");

//TEST ROUTE(testing moddleware)
router.get("/", verify, (req, res) => {
    res.send(req.user);
});

module.exports = router;
