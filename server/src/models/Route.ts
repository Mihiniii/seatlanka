import { Schema, model, InferSchemaType } from 'mongoose';

const routeSchema = new Schema(
  {
    from: { type: String, required: true, trim: true },
    to: { type: String, required: true, trim: true },
    distanceKm: { type: Number },
    stops: [{ type: String }],
  },
  { timestamps: true },
);

routeSchema.index({ from: 1, to: 1 }, { unique: true });

export type RouteAttrs = InferSchemaType<typeof routeSchema>;
export const Route = model('Route', routeSchema);
