// @/lib/auth/authUtils.ts
import crypto from 'crypto';
import { Schema } from 'mongoose';

export const generateToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const isTokenValid = (
  storedToken: string | undefined,
  storedExpiry: Date | undefined,
  inputToken: string
): boolean => {
  if (!storedToken || !storedExpiry) return false;
  return storedToken === inputToken && new Date() < new Date(storedExpiry);
};

export const SalonAdminSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'Password must be at least 8 characters'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationToken: {
    type: String,
  },
  verificationTokenExpiry: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
  },
  resetPasswordTokenExpiry: {
    type: Date,
  },
}, { timestamps: true });