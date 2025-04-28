
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/dbConnect';
import Order from '../../../../models/Order';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]/route';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'salon_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const orderId = params.id;
    
    // Find the order first
    const order = await Order.findById(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    // Validate salon admin owns this salon
    if (session.user.salon.toString() !== order.salon.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to forward this order' },
        { status: 403 }
      );
    }
    
    // Check if already forwarded
    if (order.forwardedToAdmin) {
      return NextResponse.json(
        { error: 'Order already forwarded to admin' },
        { status: 400 }
      );
    }
    
    // Forward the order
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { 
        forwardedToAdmin: true,
        forwardedAt: new Date(),
        // Update status to processing if it was pending
        ...(order.status === 'pending' ? { status: 'processing' } : {})
      },
      { new: true }
    );
    
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error forwarding order:', error);
    return NextResponse.json(
      { error: 'Failed to forward order' },
      { status: 500 }
    );
  }
}
