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

// Define the context type for dynamic routes
interface Context {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: Context) {
  await dbConnect();
  const params = await context.params;
  const id = params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findById(id)
      .populate('category', 'name')
      .populate('attributes.attributeId', 'name values')
      .lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: Context) {
  await dbConnect();
  const params = await context.params;
  const id = params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string | null;
    const category = formData.get('category') as string | null;
    const price = formData.get('price') ? parseFloat(formData.get('price') as string) : NaN;
    const discount = formData.get('discount') ? parseFloat(formData.get('discount') as string) : undefined;
    const stock = formData.get('stock') ? parseInt(formData.get('stock') as string) : NaN;
    const description = formData.get('description') as string | null;
    const howToUse = formData.get('howToUse') as string | null;
    const maxAllowedInCart = formData.get('maxAllowedInCart')
      ? parseInt(formData.get('maxAllowedInCart') as string)
      : 10;
    let attributes: any[] = [];
    try {
      const attributesRaw = formData.get('attributes') as string | null;
      if (attributesRaw) {
        attributes = JSON.parse(attributesRaw);
      }
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid attributes format' },
        { status: 400 }
      );
    }
    const images = formData.getAll('images') as File[];

    // Debug: Log formData
    console.log('FormData:', {
      id,
      name,
      category,
      price,
      stock,
      discount,
      description,
      howToUse,
      maxAllowedInCart,
      attributes,
      images: images.length,
    });

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
        // Handle attributeId as object or string
        const attributeId = typeof attr.attributeId === 'object' && attr.attributeId._id
          ? attr.attributeId._id
          : attr.attributeId;
        if (!mongoose.Types.ObjectId.isValid(attributeId)) {
          return NextResponse.json(
            { success: false, error: `Invalid attribute ID: ${attributeId}` },
            { status: 400 }
          );
        }
        const attributeExists = await Attribute.findById(attributeId);
        if (!attributeExists) {
          return NextResponse.json(
            { success: false, error: `Attribute not found: ${attributeId}` },
            { status: 404 }
          );
        }
        // Update attr to use the string attributeId
        attr.attributeId = attributeId;
      }
    }

    const updateData: any = { name, category, price, discount, stock, attributes, description, howToUse, maxAllowedInCart };
    if (images && images.length > 0) {
      if (images.length > 4) {
        return NextResponse.json(
          { success: false, error: 'Maximum 4 images allowed' },
          { status: 400 }
        );
      }
      const imageUrls: string[] = [];
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
      updateData.imageUrls = imageUrls;
    }

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name')
      .populate('attributes.attributeId', 'name values')
      .lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: Context) {
  await dbConnect();
  const params = await context.params;
  const id = params.id;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndDelete(id).lean();
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}