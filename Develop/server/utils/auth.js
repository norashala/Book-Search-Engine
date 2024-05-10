const jwt = require("jsonwebtoken");

// Set token secret and expiration date
const secret = "mysecretsshhhhh";
const expiration = "2h";

module.exports = {
    authMiddleware: function ({ req }) {
        // Allows token to be sent via the req.query or headers
        let token = req.query
            ? req.query.token
            : null || req.headers.authorization;

        if (req.headers.authorization) {
            token = token.split(" ").pop().trim();
        }

        if (!token) {
            throw new Error("You have no token!");
        }

        // Verify token and get user data out of it
        try {
            const { data } = jwt.verify(token, secret, { maxAge: expiration });
            req.user = data;
        } catch {
            throw new Error("Invalid token!");
        }

        return req; // Return the request object for the resolver to use
    },

    signToken: function ({ username, email, _id }) {
        const payload = { username, email, _id };
        return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
    },
};
