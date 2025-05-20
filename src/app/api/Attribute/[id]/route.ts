import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Attribute from '@/mongoose-models/Attribute';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const attribute = await Attribute.findById(params.id);
    
    if (!attribute) {
      return NextResponse.json(
        { success: false, error: 'Attribute not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: attribute });
  } catch (error) {
    console.error('Error fetching attribute:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching attribute' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const body = await request.json();
    const { name, values, filterable, required } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    const attribute = await Attribute.findByIdAndUpdate(
      params.id,
      {
        name,
        values: Array.isArray(values) ? values : [],
        filterable: filterable ?? false,
        required: required ?? false,
      },
      { new: true }
    );
    
    if (!attribute) {
      return NextResponse.json(
        { success: false, error: 'Attribute not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, data: attribute });
  } catch (error) {
    console.error('Error updating attribute:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating attribute' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const attribute = await Attribute.findById(params.id);
    
    if (!attribute) {
      return NextResponse.json(
        { success: false, error: 'Attribute not found' },
        { status: 404 }
      );
    }

    await Attribute.findByIdAndDelete(params.id);
    
    return NextResponse.json({ success: true, message: 'Attribute deleted' });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting attribute' },
      { status: 500 }
    );
  }
}