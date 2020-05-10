const jwt = require('jsonwebtoken');
const asyncHandler = require('./async');
const errorResponse = require('../utils/errorResponse');
const User = require('../models/User');

//Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    /* else if (req.cookie.token){
        token = req.cookie.token;
    }*/

    //Make sure token exists
    if (!token) {
        next(new errorResponse('Not authorized to access this route', 401));
    }

    //verify token
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id); //Currently logged in user
        next();
    } catch (error) {
        next(new errorResponse('Not authorized to access this route', 401));
    }

});