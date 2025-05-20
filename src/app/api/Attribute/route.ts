import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Attribute from '@/mongoose-models/Attribute';

export async function GET(request: Request) {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query: any = {};
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const attributes = await Attribute.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({ success: true, data: attributes });
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return NextResponse.json(
      { success: false, error: 'Error fetching attributes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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

    const attribute = new Attribute({
      name,
      values: Array.isArray(values) ? values : [],
      filterable: filterable ?? false,
      required: required ?? false,
    });

    await attribute.save();
    
    return NextResponse.json({ success: true, data: attribute }, { status: 201 });
  } catch (error) {
    console.error('Error creating attribute:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating attribute' },
      { status: 500 }
    );
  }
}