import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Attribute from '@/mongoose-models/Attribute';
import { requireSuperAdmin } from "@/lib/auth/guards";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const attribute = await Attribute.findById(id);

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;
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
      id,
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

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;
  try {
    await mongoose.connect(process.env.MONGODB_URI!);

    const attribute = await Attribute.findById(id);

    if (!attribute) {
      return NextResponse.json(
        { success: false, error: 'Attribute not found' },
        { status: 404 }
      );
    }

    await Attribute.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Attribute deleted' });
  } catch (error) {
    console.error('Error deleting attribute:', error);
    return NextResponse.json(
      { success: false, error: 'Error deleting attribute' },
      { status: 500 }
    );
  }
}