const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header("Authorization");

    // Check if no token
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }

    try {
        // Remove "Bearer " and verify token
        const tokenWithoutBearer = token.split(" ")[1];
        const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};
