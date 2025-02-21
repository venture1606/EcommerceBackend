const User = require('../models/user')

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../Middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const {name, email, password} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        avatar: {
            public_id: 'avatars/kccvibpsuiusmwfepb3m',
            url: 'https://res.cloudinary.com/shopit/image/upload/v1606305757/avatars/kccvibpsuiusmwfepb3m.png'
        }
    })

   sendToken(user, 200, res);
})

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log('Password error');
        return next(new ErrorHandler('Invalid Email or Password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new ErrorHandler('Invalid Email or Password', 401)); // Fixed missing status code
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler('Invalid Email or Password', 401)); // Fixed missing status code
    }

    sendToken(user, 200, res);
});

exports.forgotpassword = catchAsyncErrors( async(req, res, next) => {
    
    const user = await User.findOne({email: req.body.email});

    if (!user){
        return next(new ErrorHandler('Invaild Email, User not found in this email', 404));
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false })

    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`

    const message = `your password token is as follow: \n\n${resetUrl}\n\nIf you have not sent this email then ignore it`

    try {
        
        await sendEmail({
            email: user.email,
            subject: 'Shopit Recovery password',
            message 
        })

        res.status(200).json({
            success: true,
            message: `Email sent to: ${user.email}`
        })

    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false})
        return next(new ErrorHandler(error.message, 500))
    }

})

exports.resetPassword = catchAsyncErrors( async (req, res, next) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })

    if (!user){
        return next(new ErrorHandler('Password reset token is invaild or has been expired', 400 ))
    }

    if (req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler('Password does not match', 400))
    }


    user.password = req.body.password;
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save();

    sendToken(user, 200, res)
})

exports.getUserProfile = catchAsyncErrors( async (req, res, next) => {
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    })
})

exports.updatePassword = catchAsyncErrors( async (req, res,next) => {
    const user = await User.findById(req.user.id).select('+password');
    const isMatched = await user.comparePassword(req.body.oldPassword);

    if (!isMatched){
        return next(new ErrorHandler('Old password is incorrect', 400));
    }

    user.password = req.body.password;
    await user.save()
    sendToken(user, 200, res)
    
})

exports.updateProfile = catchAsyncErrors( async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})
 
exports.logout = catchAsyncErrors( async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message: 'Logged out'
    })
})

exports.allUsers = catchAsyncErrors( async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        success: true,
        users
    })
})

exports.getUserDetail = catchAsyncErrors( async(req, res, next) => {
    const user = await User.findById(req.params.id);

    if (!user){
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

exports.updateUser = catchAsyncErrors( async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })
})

exports.deleteUser = catchAsyncErrors( async (req, res, next) => {

    const user = await User.findByIdAndDelete(req.params.id)
    
    if (!user){
        return next(new ErrorHandler(`User does not found with id: ${req.params.id}`, 404))
    }


    res.status(200).json({
        success: true,
        message: 'User successfully removed'
    })    
})
