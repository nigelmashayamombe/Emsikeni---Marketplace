// src/routes/orderRoutes.js
import express from 'express';
import OrderController from '../controllers/OrderController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();
const controller = new OrderController();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Order'
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, controller.createOrder);

/**
 * @swagger
 * /api/orders/buyer:
 *   get:
 *     summary: Get all orders for the buyer
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of buyer orders
 *       401:
 *         description: Unauthorized
 */
router.get('/buyer', auth, controller.getBuyerOrders);

export default router;
