const jwt = require("jsonwebtoken");

module.exports = function(req, res, next) {
    const token = global.globalToken;
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
