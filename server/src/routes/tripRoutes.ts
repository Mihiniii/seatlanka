import { Router } from 'express';
import { searchTrips, getSeatMap } from '../controllers/tripController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/', asyncHandler(searchTrips));
router.get('/:id/seats', asyncHandler(getSeatMap));

export default router;
