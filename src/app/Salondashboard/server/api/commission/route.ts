
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
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
    
    // If salon admin, only show commissions for their salon
    if (session.user.role === 'salon_admin') {
      query.salon = session.user.salon;
    } 
    // Admin can see all commissions, but filter by salonId if provided
    else if (session.user.role === 'admin' && salonId) {
      query.salon = salonId;
    }
    
    // Additional filters
    if (status) {
      query.status = status;
    }
    
    const commissions = await Commission.find(query)
      .populate({
        path: 'order',
        populate: {
          path: 'customer',
          select: 'name email'
        }
      })
      .sort({ createdAt: -1 });
    
    return NextResponse.json(commissions);
  } catch (error) {
    console.error('Error fetching commissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch commissions' },
      { status: 500 }
    );
  }
}
