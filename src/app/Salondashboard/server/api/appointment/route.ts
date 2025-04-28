
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/dbConnect';
import Appointment from '../../models/Appointment';
import Service from '../../models/Service';
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
    const date = url.searchParams.get('date');
    
    let query: any = {};
    
    // If salon admin, only show appointments for their salon
    if (session.user.role === 'salon_admin') {
      query.salon = session.user.salon;
    } 
    // If customer, only show their appointments
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
    
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.startTime = { $gte: startDate, $lte: endDate };
    }
    
    const appointments = await Appointment.find(query)
      .populate('customer', 'name email')
      .populate('service')
      .sort({ startTime: 1 })
      .exec();
    
    return NextResponse.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointments' },
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
    const { customer, salon, service, startTime, notes } = body;
    
    // If salon admin creating appointment, validate it's for their salon
    if (session.user.role === 'salon_admin' && session.user.salon?.toString() !== salon) {
      return NextResponse.json(
        { error: 'Unauthorized to create appointments for this salon' },
        { status: 403 }
      );
    }
    
    // If customer creating appointment, validate it's for them
    if (session.user.role === 'customer' && session.user._id?.toString() !== customer) {
      return NextResponse.json(
        { error: 'Unauthorized to create appointments for other customers' },
        { status: 403 }
      );
    }
    
    // Get service to calculate endTime
    const serviceData = await Service.findById(service).exec();
    
    if (!serviceData) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      );
    }
    
    // Calculate end time based on service duration
    const startDateTime = new Date(startTime);
    const endDateTime = new Date(startTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + serviceData.duration);
    
    const appointment = new Appointment({
      customer,
      salon,
      service,
      startTime: startDateTime,
      endTime: endDateTime,
      notes,
      status: session.user.role === 'salon_admin' ? 'confirmed' : 'pending'
    });
    
    await appointment.save();
    
    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error('Error creating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to create appointment' },
      { status: 500 }
    );
  }
}
