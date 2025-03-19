import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongoose';
import Subscription from '@/mongoose-models/subscription'; // ✅ Your subscription model

// GET /api/subscription?userId=123
export async function GET(req: NextRequest) {
  await connectDB();

  const userId = req.nextUrl.searchParams.get('userId');

  console.log('📢 Backend received userId:', userId); // Debug!

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId parameter.' }, { status: 400 });
  }

  try {
    const subscription = await Subscription.findOne({ userId: String(userId) });

    if (!subscription) {
      console.log('⚠️ Subscription not found for userId:', userId);
      return NextResponse.json({ error: 'Subscription not found.' }, { status: 404 });
    }

    console.log('✅ Found subscription:', subscription);

    return NextResponse.json({
      plan: subscription.plan,
      price: subscription.price,
      category: subscription.category
    });
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
