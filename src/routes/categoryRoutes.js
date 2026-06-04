// src/routes/categoryRoutes.js
import express from 'express';
import {
	createCategory,
	deleteCategory,
	getAllCategoriesAdmin,
	getCategoryByIdAdmin,
	getCategoryData,
	updateCategory,
} from '../controllers/categoryController.js';
import {
	authorizeRoles,
	redirectGuestToLogin,
} from '../middlewares/authMiddleware.js';

const router = express.Router();

const adminOnly = [redirectGuestToLogin, authorizeRoles('ADMIN')];

router.get('/admin', ...adminOnly, getAllCategoriesAdmin);
router.get('/admin/:id', ...adminOnly, getCategoryByIdAdmin);
router.post('/admin', ...adminOnly, createCategory);
router.put('/admin/:id', ...adminOnly, updateCategory);
router.delete('/admin/:id', ...adminOnly, deleteCategory);

router.get('/:slug', getCategoryData);

export default router;
