import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Attribute from '@/mongoose-models/Attribute';
import { requireSuperAdmin } from "@/lib/auth/guards";

interface AttributeType {
  _id: string;
  name: string;
  values?: string[];
  filterable?: boolean;
  required?: boolean;
}

async function connectToDB(): Promise<void> {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI!);
  }
}

export async function GET(
  _request: NextRequest, // Prefix with underscore to indicate intentional non-use
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const params = await context.params;
  try {
    await connectToDB();
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

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const params = await context.params;
  try {
    await connectToDB();
    const body = await request.json();
    const { name, values, filterable, required } = body;

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
        filterable: !!filterable,
        required: !!required,
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const denied = await requireSuperAdmin();
  if (denied) return denied;
  const params = await context.params;
  try {
    await connectToDB();
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