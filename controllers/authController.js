const User = require('../models/user')
const Product = require('../models/product');

const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../Middleware/catchAsyncError');
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.registerUser = catchAsyncErrors(async (req, res, next) => {
    const {name, email, password, bikeName, phone} = req.body;

    const user = await User.create({
        name,
        email,
        password,
        bikeName,
        phone,
        avatar: {
            public_id: 'avatars/kccvibpsuiusmwfepb3m',
            url: 'https://www.366icons.com/media/01/profile-avatar-account-icon-16699.png'
        },
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

// Adding the product in the cart list
exports.addToCart = catchAsyncErrors(async (req, res, next) => {
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
        return next(new ErrorHandler('Product ID is required', 400));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const product = await Product.findById(productId);

    if (!product) {
        return next(new ErrorHandler('Product not found', 404));
    }

    const existingCartItem = user.cart.find(
        (item) => item.product.toString() === productId
    );

    if (existingCartItem) {
        // Check if stock allows increasing quantity
        if (product.stock < existingCartItem.quantity + 1) {
            return next(new ErrorHandler('Not enough stock to add more', 400));
        }
        existingCartItem.quantity += 1; // increase quantity by 1
    } else {
        // Check stock before adding new
        if (product.stock < quantity) {
            return next(new ErrorHandler('Product is out of stock', 400));
        }

        const cartItem = {
            product: productId,
            quantity
        };

        user.cart.push(cartItem);
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product added to cart successfully',
        user: user
    });
});

exports.getCartItems = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user: user
    });
});

// removing the product from the cart list
exports.removeFromCart = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
        return next(new ErrorHandler('Product ID is required', 400));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const cartItemIndex = user.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex === -1) {
        return next(new ErrorHandler('Product not found in cart', 404));
    }

    console.log('Cart item index:', cartItemIndex);

    user.cart.splice(cartItemIndex, 1);

    console.log('Updated cart:', user.cart);

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from cart successfully',
        cart: user.cart
    });
});

exports.wishlist = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
        return next(new ErrorHandler('Product ID is required', 400));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    if (user.wishlist.includes(productId)) {
        return next(new ErrorHandler('Product already in wishlist', 400));
    }

    if (typeof productId === 'string' && productId.trim() !== '') {
        user.wishlist.push(productId);
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product added to wishlist successfully',
        user: user
    });
});

exports.getWishlist = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate('wishlist');

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    res.status(200).json({
        success: true,
        user: user
    });
});

exports.removeFromWishlist = catchAsyncErrors(async (req, res, next) => {
    const { productId } = req.body;

    if (!productId) {
        return next(new ErrorHandler('Product ID is required', 400));
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return next(new ErrorHandler('User not found', 404));
    }

    const wishlistIndex = user.wishlist.findIndex(item => item.toString() === productId);

    if (wishlistIndex === -1) {
        return next(new ErrorHandler('Product not found in wishlist', 404));
    }

    user.wishlist.splice(wishlistIndex, 1);
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Product removed from wishlist successfully',
        user: user
    });
});
