const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    console.log(globalToken);
    console.log(global.globalToken);
    const token = req.body.token;
    if (!token) {
        req.user = "Access denied";
        next();
    }
    try {
        const verified = jwt.verify(token, process.env.TOKEN_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        req.user = "Invalid token";
        next();
    }
}
