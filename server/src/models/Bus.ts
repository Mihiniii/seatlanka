import { Schema, model, InferSchemaType } from 'mongoose';

const busSchema = new Schema(
  {
    operator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    operatorName: { type: String, required: true },
    busNumber: { type: String, required: true, unique: true, uppercase: true },
    type: { type: String, enum: ['Luxury AC', 'Semi-luxury', 'Normal'], required: true },
    // Seat layout: e.g. 10 rows, seats per side "2+2"
    rows: { type: Number, required: true, min: 1, max: 20 },
    layout: { type: String, enum: ['2+2', '2+3'], default: '2+2' },
    amenities: [{ type: String }],
  },
  { timestamps: true },
);

export type BusAttrs = InferSchemaType<typeof busSchema>;

/** Seat ids for a bus, e.g. 1A, 1B, 1C, 1D ... */
export function seatIdsFor(bus: { rows: number; layout: string }): string[] {
  const letters = bus.layout === '2+3' ? ['A', 'B', 'C', 'D', 'E'] : ['A', 'B', 'C', 'D'];
  const ids: string[] = [];
  for (let r = 1; r <= bus.rows; r++) {
    for (const l of letters) ids.push(`${r}${l}`);
  }
  return ids;
}

export const Bus = model('Bus', busSchema);
