
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Order from '../../models/Order';
import Commission from '../../models/Commission';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const url = new URL(req.url);
    const salonId = url.searchParams.get('salonId');
    const status = url.searchParams.get('status');
    
    let query: any = {};
    
    // If salon admin, only show orders for their salon
    if (session.user.role === 'salon_admin') {
      query.salon = session.user.salon;
    } 
    // If customer, only show their orders
    else if (session.user.role === 'customer') {
      query.customer = session.user._id;
    }
    
    // Additional filters
    if (salonId) {
      query.salon = salonId;
    }
    
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('customer', 'name email')
      .populate({
        path: 'products.product',
        model: 'Product'
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
    
    // Calculate commission amount (5% of total)
    const commissionAmount = body.totalAmount * 0.05;
    
    // Create order
    const order = await Order.create({
      ...body,
      commissionAmount,
      forwardedToAdmin: false
    });
    
    // Create commission record
    await Commission.create({
      salon: order.salon,
      order: order._id,
      amount: commissionAmount,
      status: 'pending'
    });
    
    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
