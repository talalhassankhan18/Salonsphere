import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '@/mongoose-models/User';
import dbConnect from '@/dbConnect';

export async function POST(req: NextRequest) {
  await dbConnect();
  const authHeader = req.headers.get('Authorization');
  const token = authHeader?.split(' ')[1];

  try {
    if (!token) {
      return NextResponse.json({ message: 'Token required' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string };
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
    return NextResponse.json({ token: newToken }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }
}