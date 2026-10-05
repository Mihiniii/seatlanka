import { Router } from 'express';
import { holdSeats, confirmBooking, myBookings, cancelBooking } from '../controllers/bookingController';
import { protect, allow } from '../middleware/auth';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.use(protect, allow('passenger', 'admin'));
router.post('/hold', asyncHandler(holdSeats));
router.post('/confirm', asyncHandler(confirmBooking));
router.get('/mine', asyncHandler(myBookings));
router.patch('/:id/cancel', asyncHandler(cancelBooking));

export default router;
