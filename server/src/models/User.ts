import bcrypt from 'bcryptjs';
import { Schema, model, InferSchemaType, HydratedDocument } from 'mongoose';

export const ROLES = ['passenger', 'operator', 'admin'] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ROLES, default: 'passenger' },
  },
  { timestamps: true },
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export type UserAttrs = InferSchemaType<typeof userSchema>;
export type UserDoc = HydratedDocument<UserAttrs>;

export async function comparePassword(user: UserDoc, candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, user.password);
}

export const User = model('User', userSchema);
