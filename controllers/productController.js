const Product = require('../models/product')

const errorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../Middleware/catchAsyncError')
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('../utils/cloudinary')


// Create a new product => /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next) => {

    // Ensure exactly 5 images are uploaded
    if (!req.files || req.files.length !== 5) {
        return next(new errorHandler('Please upload exactly 5 images', 400));
    }

    req.body.user = req.user.id;

    // Validate required fields
    if (!req.body.name || !req.body.description || !req.body.category || !req.body.stock || 
        !req.body.brand || !req.body.price || !req.body.originalPrice) {
        return next(new errorHandler('Enter all required fields', 400));
    }

    // Upload images to Cloudinary
    let uploadedImages = [];
    for (let file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
            folder: "products",
            width: 500,
            crop: "scale"
        });

        uploadedImages.push({
            public_id: result.public_id,
            url: result.secure_url
        });
    }

    // Assign uploaded images to the request body
    req.body.images = uploadedImages;

    // Create the product
    const product = await Product.create(req.body);

    res.status(201).json({
        success: true,
        message: "Product added successfully",
        product
    });
});

exports.getProduct = catchAsyncError( async (req, res, next) => {
    const resPerPage = 3;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resPerPage)  
    const products = await apiFeatures.query;

    res.status(200).json({
        success : true,
        count: products.length,
        productsCount,
        resPerPage,
        products
    })
})

// get single product details => /api/v1/product/:id
exports.getSingleProduct = catchAsyncError( async (req, res, next) => {
    const product = await Product.findById(req.params.id);

    if (!product){
        return next(new errorHandler('Product Not Found', 404))
    }

    res.status(200).json({
        success: true,
        product
    })

})

exports.updateProduct = catchAsyncError( async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product){
        return next(new errorHandler('Product Not Found', 404))

    }

    product = await Product.findByIdAndUpdate( req.params.id , req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: true
    });

    res.status(200).json({
        success: true,
        product
    })
})

exports.deleteProduct = catchAsyncError( async (req, res, next) => {
    const product = await Product.findById(req.params.id);
    
    if (!product){
        return next(new errorHandler('Product Not Found', 404))
    }

    await product.deleteOne({id: product._id});

    res.status(200).json({
        success: true,
        message: "Product is deleted"
    })
})

exports.createProductReview = catchAsyncError( async (req, res, next) => {
    const { rating, comment, productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )

    if (isReviewed){
        product.reviews.forEach(review => {
            if (review.user.toString() === req.user._id.toString()){
                
                review.comment = comment;
                review.rating = rating;
            }
        })
    } else {
        product.reviews.push(review);
        product.numOfReview = product.reviews.length
    }

    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })
})

exports.getReviews = catchAsyncError( async (req, res, next) => {
    const product = await Product.findById(req.query.id)

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteReview = catchAsyncError( async (req, res, next) => {
    const product = await Product.findById(req.query.productId)

    const reviews = product.reviews.filter(BalanceReviews => BalanceReviews._id.toString() !== req.query.id.toString()) //id-> target id

    const numOfReview = reviews.length;
    const ratings = product.reviews.reduce((acc, item) => item.rating + acc, 0) / reviews.length
    
    await Product.findByIdAndUpdate(req.query.productId, {
        reviews,
        ratings,
        numOfReview
    },{
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true
    })
})