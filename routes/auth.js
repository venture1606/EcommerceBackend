const express = require('express')
const router = express.Router();

const { 
    registerUser, 
    loginUser, 
    logout, 
    forgotpassword, 
    resetPassword,
    getUserProfile,
    getUserDetail, 
    updatePassword,
    updateProfile,
    allUsers,
    updateUser,
    deleteUser,
    addToCart,
    getCartItems,
    removeFromCart,
    wishlist,
    getWishlist,
    removeFromWishlist
} = require('../controllers/authController')

const { isAuthenticatedUser, authorizeRoles } = require('../Middleware/auth')

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/logout').get(logout);
router.route('/password/forgot').post(forgotpassword);
router.route('/password/reset/:token').put(resetPassword);
router.route('/me').get(isAuthenticatedUser, getUserProfile);
router.route('/password/update').put(isAuthenticatedUser, updatePassword)
router.route('/me/update').put(isAuthenticatedUser, updateProfile)
router.route('/admin/users').get(isAuthenticatedUser, authorizeRoles('admin'), allUsers)
router.route('/admin/user/:id')
    .get(isAuthenticatedUser, authorizeRoles('admin'), getUserDetail)
    .put(isAuthenticatedUser, authorizeRoles('admin'), updateUser)
    .delete(isAuthenticatedUser, authorizeRoles('admin'), deleteUser)

router.route('/cart').post(isAuthenticatedUser, addToCart);
router.route('/cart/items').get(isAuthenticatedUser, getCartItems);
router.route('/cart/remove').delete(isAuthenticatedUser, removeFromCart);

router.route('/wishlist').post(isAuthenticatedUser, wishlist);
router.route('/wishlist/items').get(isAuthenticatedUser, getWishlist);
router.route('/wishlist/remove').delete(isAuthenticatedUser, removeFromWishlist);

module.exports = router;