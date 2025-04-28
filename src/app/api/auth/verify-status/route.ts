import { NextRequest, NextResponse } from 'next/server';
import User from '@/mongoose-models/User';
import dbConnect from '@/dbConnect';

export async function GET(req: NextRequest) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    return NextResponse.json({ isVerified: user.emailVerified }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Failed to check verification status' }, { status: 500 });
  }
}