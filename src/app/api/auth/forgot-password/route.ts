import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import User from '@/mongoose-models/User';
import dbConnect from '@/dbConnect';
import { sendPasswordResetEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'If an account exists, a reset link will be sent' }, { status: 200 });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json({ message: 'If an account exists, a reset link will be sent' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to process request' }, { status: 500 });
  }
}