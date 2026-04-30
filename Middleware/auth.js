const User = require('../models/user')

const jwt = require('jsonwebtoken')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../Middleware/catchAsyncError')

exports.isAuthenticatedUser = catchAsyncErrors( async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    // console.log(Object.getOwnPropertyNames(req));
    
    if (!token){
        return next(new ErrorHandler ('Login First to access this resource', 401))
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return next(new ErrorHandler('Invalid or expired token. Please login again.', 401));
    }

    req.user = await User.findById(decoded.id);
    if (!req.user) {
        return next(new ErrorHandler('User belonging to this token no longer exists.', 401));
    }
    next()
})

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)){
            return next(new ErrorHandler(`Role (${req.user.role}) is not allowed to access this resource`, 403))
        }
        
        next()
    }
}