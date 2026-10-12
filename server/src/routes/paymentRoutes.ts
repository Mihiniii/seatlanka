import express, { Router } from 'express';
import { paymentConfig, createCheckout, payhereNotify, orderStatus } from '../controllers/paymentController';
import { protect, allow } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/config', paymentConfig);
// PayHere posts a form (not JSON) and has no login, so this route sits above protect.
router.post('/notify', express.urlencoded({ extended: false }), asyncHandler(payhereNotify));

router.use(protect, allow('passenger', 'admin'));
router.post('/checkout', asyncHandler(createCheckout));
router.get('/orders/:orderId', asyncHandler(orderStatus));

export default router;
