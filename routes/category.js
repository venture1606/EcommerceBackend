const express = require('express')
const router = express.Router();
const upload = require('../Middleware/upload');

const { 
    newCategory,
    getCategories,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const {isAuthenticatedUser, authorizeRoles} = require('../Middleware/auth')

router.route('/category/new').post(isAuthenticatedUser, authorizeRoles('admin', 'member'), upload.single('image'), newCategory);
router.route('/categories').get(getCategories);
router.route('/category/:id')
.put(isAuthenticatedUser, authorizeRoles('admin'), updateCategory)
.delete(isAuthenticatedUser, authorizeRoles('admin'), deleteCategory);

module.exports = router