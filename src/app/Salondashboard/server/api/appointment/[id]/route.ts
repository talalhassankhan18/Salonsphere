
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/dbConnect';
import Appointment from '../../../models/Appointment';
import Service from '../../../models/Service';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const appointmentId = params.id;
    // Use exec() to properly resolve the mongoose query
    const appointment = await Appointment.findById(appointmentId)
      .populate('customer', 'name email')
      .populate('service')
      .exec();
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (session.user.role === 'salon_admin' && 
        appointment.salon.toString() !== session.user.salon?.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to view this appointment' },
        { status: 403 }
      );
    }
    
    if (session.user.role === 'customer' && 
        appointment.customer._id.toString() !== session.user._id?.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to view this appointment' },
        { status: 403 }
      );
    }
    
    return NextResponse.json(appointment);
  } catch (error) {
    console.error('Error fetching appointment:', error);
    return NextResponse.json(
      { error: 'Failed to fetch appointment' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const appointmentId = params.id;
    const body = await req.json();
    
    // Find the appointment first
    const appointment = await Appointment.findById(appointmentId).exec();
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (session.user.role === 'salon_admin' && 
        appointment.salon.toString() !== session.user.salon?.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }
    
    if (session.user.role === 'customer' && 
        appointment.customer.toString() !== session.user._id?.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to update this appointment' },
        { status: 403 }
      );
    }
    
    // If changing service, recalculate end time
    if (body.service && body.service !== appointment.service.toString()) {
      const service = await Service.findById(body.service).exec();
      
      if (!service) {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      
      const startTime = body.startTime ? new Date(body.startTime) : appointment.startTime;
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.duration);
      
      body.endTime = endTime;
    } else if (body.startTime) {
      // If only changing start time, recalculate end time based on existing service
      const service = await Service.findById(appointment.service).exec();
      const startTime = new Date(body.startTime);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + service.duration);
      
      body.endTime = endTime;
    }
    
    // Update appointment
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      { $set: body },
      { new: true, runValidators: true }
    )
      .populate('customer', 'name email')
      .populate('service')
      .exec();
    
    return NextResponse.json(updatedAppointment);
  } catch (error) {
    console.error('Error updating appointment:', error);
    return NextResponse.json(
      { error: 'Failed to update appointment' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const appointmentId = params.id;
    
    // Find the appointment first
    const appointment = await Appointment.findById(appointmentId).exec();
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    // Check permissions
    if (session.user.role === 'salon_admin' && 
        appointment.salon.toString() !== session.user.salon?.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this appointment' },
        { status: 403 }
      );
    }
    
    if (session.user.role === 'customer' && 
        appointment.customer.toString() !== session.user._id?.toString()) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this appointment' },
        { status: 403 }
      );
    }
    
    await Appointment.findByIdAndDelete(appointmentId).exec();
    
    return NextResponse.json(
      { message: 'Appointment deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting appointment:', error);
    return NextResponse.json(
      { error: 'Failed to delete appointment' },
      { status: 500 }
    );
  }
}
