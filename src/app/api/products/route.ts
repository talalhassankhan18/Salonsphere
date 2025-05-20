import dbConnect from '@/dbConnect';
import Product from '@/mongoose-models/product';
import Category from '@/mongoose-models/categories';
import Attribute from '@/mongoose-models/Attribute';
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query: any = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    query.category = { $type: 'objectId' };

    const products = await Product.find(query)
      .populate('category', 'name')
      .populate('attributes.attributeId', 'name values')
      .lean();
    return NextResponse.json({ success: true, data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const price = parseFloat(formData.get('price') as string);
    const discount = formData.get('discount') ? parseFloat(formData.get('discount') as string) : undefined;
    const stock = parseInt(formData.get('stock') as string);
    const description = formData.get('description') as string;
    const howToUse = formData.get('howToUse') as string;
    const maxAllowedInCart = formData.get('maxAllowedInCart') ? parseInt(formData.get('maxAllowedInCart') as string) : 10;
    const attributes = JSON.parse(formData.get('attributes') as string);
    const images = formData.getAll('images') as File[];

    if (!name || !category || isNaN(price) || isNaN(stock)) {
      return NextResponse.json(
        { success: false, error: 'Name, category, price, and stock are required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    if (attributes && Array.isArray(attributes)) {
      for (const attr of attributes) {
        if (!mongoose.Types.ObjectId.isValid(attr.attributeId)) {
          return NextResponse.json(
            { success: false, error: `Invalid attribute ID: ${attr.attributeId}` },
            { status: 400 }
          );
        }
        const attributeExists = await Attribute.findById(attr.attributeId);
        if (!attributeExists) {
          return NextResponse.json(
            { success: false, error: `Attribute not found: ${attr.attributeId}` },
            { status: 404 }
          );
        }
      }
    }

    const imageUrls: string[] = [];
    if (images && images.length > 0) {
      if (images.length > 4) {
        return NextResponse.json(
          { success: false, error: 'Maximum 4 images allowed' },
          { status: 400 }
        );
      }
      for (const image of images) {
        if (image) {
          const buffer = Buffer.from(await image.arrayBuffer());
          const uploadResult = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
              { folder: 'products' },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            );
            uploadStream.end(buffer);
          });
          imageUrls.push((uploadResult as any).secure_url);
        }
      }
    }

    const product = new Product({
      name,
      category,
      price,
      discount,
      stock,
      attributes,
      imageUrls,
      description,
      howToUse,
      maxAllowedInCart,
      status: stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'Active',
      sold: 0,
      revenue: 0,
    });

    await product.save();
    const populatedProduct = await Product.findById(product._id)
      .populate('category', 'name')
      .populate('attributes.attributeId', 'name values')
      .lean();

    return NextResponse.json({ success: true, data: populatedProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create product' },
      { status: 500 }
    );
  }
}