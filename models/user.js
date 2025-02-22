const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jtw = require('jsonwebtoken')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'Please enter your name'],
        maxlength: [30, 'Your name cannot exceed 30 characters']
    },
    email:{
        type: String,
        required: [true, 'Please enter your email'],
        unique: true,
        validate: [validator.isEmail, 'Please enter valid email address']
    },
    password:{
        type: String,
        required: [true, 'Please enter your password'],
        minlength: [6, 'Your password must be longer than characters'],
        select: false
    },
    avatar:{
        public_id:{
            type: String,
            required: true 
        },
        url:{
            type: String,
            required: true
        }
    },
    bikeName:{
        type: String,
        required: [true, 'Please enter your bike name']
    },
    phone: {
        type: Number,
        required: [true, 'Please enter your phone number'],
    },
    role:{
        type: String,
        default: 'user'
    },
    wishlist: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",  // Reference to ProductSchema
        }
    ],
    cart: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            quantity: { type: Number, default: 1 }  // Quantity for cart items
        }
    ],
    createAt:{
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date
})

userSchema.pre('save', async function(next){
    if (!this.isModified('password')){
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

userSchema.methods.comparePassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password)
}

userSchema.methods.getJwtToken = function () {
    return jtw.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_TIME
    })
}

userSchema.methods.getResetPasswordToken = function () {
    // Generate reset token.
    const resetToken = crypto.randomBytes(20).toString('hex');
    
    // hash and set resetPasswordToken
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    
    // 30 min in expires
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000
    return resetToken
}

module.exports = mongoose.model('User', userSchema);