const jwt= require('jsonwebtoken');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const user= require('../model/userModel');

const isAuthenticated = catchAsync(async (req, res, next) => {
    // 1) Getting token and check if it's there
    let token;
   
    if (req.cookies?.jwt) {
        token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }


    if (!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    // 2) Verification of token
    // const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(new AppError('Invalid token. Please log in again.', 401));
    }   

    // 3) Check if user still exists
    const currentUser = await user.findById(decoded._id);
    if (!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    // 4) Grant access to protected route
    req.user = currentUser;
    next();
});

module.exports = isAuthenticated;

