import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Coupon from '@/mongoose-models/coupons';
import { requireSuperAdmin } from "@/lib/auth/guards";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const coupon = await Coupon.findById(params.id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: coupon });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching coupon' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const body = await request.json();
    const { code, discount, type, minPurchase, limit, startDate, endDate } = body;

    // Validate required fields
    if (!code || !discount || !type || !startDate || !endDate) {
      return NextResponse.json(
        { success: false, error: 'Code, discount, type, start date, and end date are required' },
        { status: 400 }
      );
    }

    // Validate coupon type
    const validTypes = ['Percentage', 'Fixed Amount', 'Shipping'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coupon type' },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Ensure end date is after start date
    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Update the coupon
    const coupon = await Coupon.findByIdAndUpdate(
      params.id,
      {
        code,
        discount,
        type,
        minPurchase: minPurchase ?? 0,
        limit: limit ?? 0,
        startDate: start,
        endDate: end,
        status: end < new Date() ? 'Expired' : 'Active',
      },
      { new: true }
    );
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: coupon });
  } catch (error: any) {
    console.error('Error updating coupon:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, error: 'Coupon code already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Error updating coupon' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const coupon = await Coupon.findById(params.id);
    
    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Coupon not found' },
        { status: 404 }
      );
    }

    await Coupon.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true, message: 'Coupon deleted' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting coupon' },
      { status: 500 }
    );
  }
}