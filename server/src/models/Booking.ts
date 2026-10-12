import { Schema, model, InferSchemaType } from 'mongoose';

export const BOOKING_STATUS = ['held', 'confirmed', 'cancelled'] as const;

/**
 * One document per seat. The partial unique index on (trip, seat) for
 * active bookings is what stops two people from getting the same seat:
 * if two requests race, MongoDB rejects the second insert (E11000).
 */
const bookingSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    trip: { type: Schema.Types.ObjectId, ref: 'Trip', required: true },
    seat: { type: String, required: true },
    status: { type: String, enum: BOOKING_STATUS, default: 'held' },
    holdExpiresAt: { type: Date },
    ticketCode: { type: String },
    // Seats paid for together share one PayHere order
    orderId: { type: String, index: true },
    paymentId: { type: String },
  },
  { timestamps: true },
);

bookingSchema.index(
  { trip: 1, seat: 1 },
  { unique: true, partialFilterExpression: { status: { $in: ['held', 'confirmed'] } } },
);

export type BookingAttrs = InferSchemaType<typeof bookingSchema>;
export const Booking = model('Booking', bookingSchema);
