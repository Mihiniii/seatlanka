import { Schema, model, InferSchemaType } from 'mongoose';

const tripSchema = new Schema(
  {
    bus: { type: Schema.Types.ObjectId, ref: 'Bus', required: true },
    route: { type: Schema.Types.ObjectId, ref: 'Route', required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    price: { type: Number, required: true, min: 0 }, // LKR per seat
  },
  { timestamps: true },
);

tripSchema.index({ route: 1, departureTime: 1 });

export type TripAttrs = InferSchemaType<typeof tripSchema>;
export const Trip = model('Trip', tripSchema);
