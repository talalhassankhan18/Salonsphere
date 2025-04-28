
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Service from '../../models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    
    const url = new URL(req.url);
    const salonId = url.searchParams.get('salonId');
    
    if (!salonId) {
      return NextResponse.json(
        { error: 'Salon ID is required' },
        { status: 400 }
      );
    }
    
    const services = await Service.find({ salon: salonId });
    
    return NextResponse.json(services);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'salon_admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const body = await req.json();
    const { name, description, duration, price, category, image, salon } = body;
    
    // Validate salon admin owns this salon
    if (session.user.salon.toString() !== salon) {
      return NextResponse.json(
        { error: 'Unauthorized to add services to this salon' },
        { status: 403 }
      );
    }
    
    const service = await Service.create({
      name,
      description,
      duration,
      price,
      category,
      image,
      salon
    });
    
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}
