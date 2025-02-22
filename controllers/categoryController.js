const Category = require('../models/category');

const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../Middleware/catchAsyncError');
const cloudinary = require('../utils/cloudinary');

// Create a new category => /api/v1/category/new
exports.newCategory = catchAsyncErrors(async (req, res, next) => {
    let imageUploadResult;

    if (!req.file) {
        return next(new ErrorHandler("Please upload a category image", 400));
    }

    // Upload image to Cloudinary
    imageUploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories",
        width: 500,
        crop: "scale"
    });

    const category = await Category.create({
        name: req.body.name,
        image: {
            public_id: imageUploadResult.public_id,
            url: imageUploadResult.secure_url
        },
        productsCount: req.body.productsCount || 0
    });

    res.status(201).json({
        success: true,
        category
    });
});

// Get all categories => /api/v1/categories
exports.getCategories = catchAsyncErrors( async (req, res, next) => {
    const categories = await Category.find();

    res.status(200).json({
        success: true,
        count: categories.length,
        categories
    })
})

// updating the category => /api/v1/category/:id
exports.updateCategory = catchAsyncErrors( async (req, res, next) => {
    let category = await Category.findById(req.params.id);

    if (!category){
        return next(new ErrorHandler('Category not found', 404))
    }

    category = await Category.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: true
    });

    res.status(200).json({
        success: true,
        category
    })
})

// deleting the category => /api/v1/category/:id
exports.deleteCategory = catchAsyncErrors( async (req, res, next) => {
    const category = await Category.findById(req.params.id);

    if (!category){
        return next(new ErrorHandler('Category not found', 404))
    }

    await category.remove();

    res.status(200).json({
        success: true,
        message: 'Category is deleted'
    })
})