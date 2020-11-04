const HttpError = require("../models/http-error");

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {    
    try {
        const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer Token'
        if(!token) {
            throw new Error('Authentication Failed!');
        }
        const decodedToken = jwt.verify(token, 'secret_dont_share');
        req.userData = {userId: decodedToken.userId}
        next();
    } catch(err) {
        const error = new HttpError(
            'Authentication Failed!',
            401
        )
        return next(error);
    }
    
};