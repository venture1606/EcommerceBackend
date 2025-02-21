const Product = require('../models/product')

const errorHandler = require('../utils/errorHandler')
const catchAsyncError = require('../Middleware/catchAsyncError')
const APIFeatures = require('../utils/apiFeatures')


// Create a new product => /api/v1/product/new
exports.newProduct = catchAsyncError(async (req, res, next) => {
    // console.log(Object.getOwnPropertyNames(req.user.id));
    req.body.user = req.user.id

    const product = await Product.create(req.body);
    res.status(201).json({
        success: true,
        message: "This is a message",
        product
    })
})

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