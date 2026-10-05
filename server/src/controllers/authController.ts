import { Request, Response } from 'express';
import { z } from 'zod';
import { User, comparePassword } from '../models/User';
import { signToken } from '../middleware/auth';
import { AppError } from '../utils/AppError';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['passenger', 'operator']).default('passenger'), // admins are created manually
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function publicUser(u: { _id: unknown; name: string; email: string; role: string }) {
  return { id: String(u._id), name: u.name, email: u.email, role: u.role };
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  if (await User.exists({ email: data.email })) {
    throw new AppError(409, 'An account with this email already exists');
  }
  const user = await User.create(data);
  const token = signToken({ id: String(user._id), role: user.role });
  res.status(201).json({ token, user: publicUser(user) });
}

export async function login(req: Request, res: Response) {
  const { email, password } = loginSchema.parse(req.body);
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await comparePassword(user, password))) {
    throw new AppError(401, 'Wrong email or password');
  }
  const token = signToken({ id: String(user._id), role: user.role });
  res.json({ token, user: publicUser(user) });
}

export async function me(req: Request, res: Response) {
  const user = await User.findById(req.user!.id);
  if (!user) throw new AppError(404, 'User not found');
  res.json({ user: publicUser(user) });
}
