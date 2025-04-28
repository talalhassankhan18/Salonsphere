import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/mongoose-models/User';
import VerificationToken from '@/mongoose-models/VerificationToken';
import dbConnect from '@/dbConnect';
import { sendVerificationEmail } from '@/lib/emailService';

export async function POST(req: NextRequest) {
  await dbConnect();
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ message: 'Email is required' }, { status: 400 });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' }, { status: 400 });
    }

    await VerificationToken.deleteMany({ userId: user._id });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
    const verificationToken = new VerificationToken({
      userId: user._id,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    await verificationToken.save();

    await sendVerificationEmail(email, token, user._id.toString());

    return NextResponse.json({ message: 'Verification email resent' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to resend verification email' }, { status: 500 });
  }
}