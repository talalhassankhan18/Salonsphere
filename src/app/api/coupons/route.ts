import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Coupon from '@/mongoose-models/coupons';
import { requireSuperAdmin } from "@/lib/auth/guards";

export async function GET(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query: any = {};
    
    if (search) {
      query.$or = [
        { code: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
      ];
    }

    const coupons = await Coupon.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching coupons' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const body = await request.json();
    const { code, discount, type, minPurchase, limit, startDate, endDate } = body;

    if (!code || !discount || !type || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Code, discount, type, start date, and end date are required' },
        { status: 400 }
      );
    }

    const validTypes = ['Percentage', 'Fixed Amount', 'Shipping'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon type' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const coupon = new Coupon({
      code,
      discount,
      type,
      minPurchase: minPurchase ?? 0,
      limit: limit ?? 0,
      used: 0,
      status: end < new Date() ? 'Expired' : 'Active',
      startDate: start,
      endDate: end,
    });

    await coupon.save();
    
    return NextResponse.json({ success: true, data: coupon }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Error creating coupon' },
      { status: 500 }
    );
  }
}