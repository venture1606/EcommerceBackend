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

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    // console.log(decoded);
    req.user = await User.findById(decoded.id)
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