import dbConnect from '@/dbConnect';
import Category from '@/mongoose-models/categories';
import { NextResponse } from 'next/server';
import { requireSuperAdmin } from "@/lib/auth/guards";

interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  subcategories: string[];
  featured: boolean;
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;
  await dbConnect();

  try {
    const category = await Category.findOne({ id: parseInt(id, 10) }).lean() as ICategory | null;
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json({ error: 'Failed to fetch category' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;
  await dbConnect();

  try {
    const body = await request.json();

    // Remove read-only or id fields to prevent unintended updates
    const updateData = { ...body };
    delete updateData.id;

    const category = await Category.findOneAndUpdate(
      { id: parseInt(id, 10) },
      { $set: updateData },
      { new: true }
    ).lean() as ICategory | null;
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Error updating category:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const { id } = await params;
  await dbConnect();

  try {
    const category = await Category.findOneAndDelete({ id: parseInt(id, 10) }).lean() as ICategory | null;
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}