// src/routes/productRoutes.js
import express from 'express';
import ProductController from '../controllers/ProductController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const controller = new ProductController();

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - category
 *         - price
 *         - condition
 *         - location
 *         - images
 *         - deliveryOptions
 *       properties:
 *         name:
 *           type: string
 *           description: The product name
 *         description:
 *           type: string
 *           description: The product description
 *         category:
 *           type: string
 *           enum: [electronics, fashion, home, automotive, books, sports, beauty, agriculture, services, other]
 *         price:
 *           type: number
 *           description: The product price
 *         condition:
 *           type: string
 *           enum: [new, used, refurbished]
 *         location:
 *           type: object
 *           properties:
 *             city:
 *               type: string
 *             province:
 *               type: string
 *             address:
 *               type: string
 *         images:
 *           type: array
 *           items:
 *             type: string
 *         deliveryOptions:
 *           type: array
 *           items:
 *             type: string
 *             enum: [delivery, pickup, both]
 *         negotiable:
 *           type: boolean
 *           default: false
 */

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, controller.createProduct);

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: condition
 *         schema:
 *           type: string
 *         description: Filter by condition
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
router.get('/', controller.getAllProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 */
router.get('/:id', controller.getProductById);

export default router;
