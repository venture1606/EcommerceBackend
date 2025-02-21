const express = require('express')
const router = express.Router();

const { 
    getProduct, 
    newProduct, 
    getSingleProduct, 
    updateProduct,
    deleteProduct,
    createProductReview,
    getReviews,
    deleteReview
} = require('../controllers/productController');

const {isAuthenticatedUser, authorizeRoles} = require('../Middleware/auth')

router.route('/products').get(getProduct);
router.route('/product/:id').get(getSingleProduct);


router.route('/admin/product/new').post(isAuthenticatedUser, authorizeRoles('admin', 'seller'), newProduct);
router.route('/admin/product/:id')
.put(isAuthenticatedUser, authorizeRoles('admin', 'seller'), updateProduct)
.delete(isAuthenticatedUser, authorizeRoles('admin', 'seller'), deleteProduct);

router.route('/review').put(isAuthenticatedUser, createProductReview)
router.route('/reviews').get(isAuthenticatedUser, getReviews)
router.route('/reviews').delete(isAuthenticatedUser, deleteReview)


module.exports = router;