// src/routes/categoryRoutes.js
import express from 'express';
import { getCategoryData } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/:slug', getCategoryData);

export default router;
