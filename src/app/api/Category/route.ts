import dbConnect from '@/dbConnect';
import Category from '@/mongoose-models/categories';
import { NextResponse } from 'next/server';

interface ICategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  subcategories: string[];
  featured: boolean;
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    const categories = await Category.find({}).lean() as ICategory[];
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
    }
    const lastCategory = await Category.findOne().sort({ id: -1 }).lean() as ICategory | null;
    const newId = lastCategory ? lastCategory.id + 1 : 1;
    const category = new Category({
      id: newId,
      name: body.name,
      slug: body.slug,
      description: body.description || '',
      productCount: body.productCount ?? 0,
      subcategories: body.subcategories || [],
      featured: body.featured || false,
    });
    await category.save();
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category with this slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}