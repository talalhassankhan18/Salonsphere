import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/mongoose-models/User';
import dbConnect from '@/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { token, password } = await req.json();

  if (!token || !password) {
    return NextResponse.json({ message: 'Token and password are required' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: new Date() } });
    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired reset token' }, { status: 400 });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: 'Password reset successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to reset password' }, { status: 500 });
  }
}