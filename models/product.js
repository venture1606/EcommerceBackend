const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please enter product name'],
        trim: true,
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    price: {
        type: Number,
        required: [true, 'Please enter product price'],
        maxLength: [5, 'Product Price cannot exceed 5 character'],
        default: 0.0
    },
    originalPrice: {
        type: Number,
        required: [true, 'Please enter product original price'],
        maxLength: [5, 'Product Price cannot exceed 5 character'],
        default: 0.0
    },
    description: {
        type: String,
        required: [true, 'Please enter the Product description']
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: {
        type: [
            {
                public_id: {
                    type: String,
                    required: true
                },
                url: {
                    type: String,
                    required: true
                }
            }
        ],
        validate: {
            validator: function (val) {
                return val.length === 5; // Ensures exactly 5 images are stored
            },
            message: 'A product must have exactly 5 images'
        }
    },
    category: {
        type: String,
        required: [true, 'Please select category for this product'],
    },
    brand: {
        type: String,
        required: [true, 'Please enter product brand']
    },
    model:{
        type: String,
        required: [true, 'Please enter product model']
    },
    stock: {
        type: Number,
        required: [true, 'Plese enter the product stock'],
        maxLength: [5, 'product name connot exceed 5 character'],
        default: 0
    },
    numOfReview: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: 'User',
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String,
                required: true
            }
        }
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', productSchema);