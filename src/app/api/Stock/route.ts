import dbConnect from '@/dbConnect';
import Stock from '@/mongoose-models/stock';
import Product from '@/mongoose-models/product';
import Attribute from '@/mongoose-models/Attribute';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    let query: any = {};
    if (search) {
      query = {
        $or: [
          { productName: { $regex: search, $options: 'i' } },
          { sku: { $regex: search, $options: 'i' } },
          { 'category.name': { $regex: search, $options: 'i' } },
        ],
      };
    }

    const stockItems = await Stock.find(query)
      .populate('category', 'name')
      .lean();
    return NextResponse.json({ success: true, data: stockItems });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    const { productId, stockQuantity, reserved, lowStockThreshold, reorderPoint, warehouse } = body;

    if (!productId || stockQuantity === undefined || !lowStockThreshold || !reorderPoint || !warehouse) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const product = await Product.findById(productId).populate('category', 'name');
    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if stock entry already exists for this product
    const existingStock = await Stock.findOne({ productId });
    if (existingStock) {
      return NextResponse.json(
        { success: false, error: 'Stock entry already exists for this product' },
        { status: 400 }
      );
    }

    const sku = `PROD-${product._id.toString().slice(-6)}-${new Date().getTime().toString().slice(-6)}`;
    const stock = new Stock({
      productId,
      productName: product.name,
      category: product.category._id,
      sku,
      stockQuantity,
      reserved: reserved || 0,
      available: stockQuantity - (reserved || 0),
      lowStockThreshold,
      reorderPoint,
      warehouse,
    });

    await stock.save();
    const populatedStock = await Stock.findById(stock._id)
      .populate('category', 'name')
      .lean();

    return NextResponse.json({ success: true, data: populatedStock }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create stock' },
      { status: 500 }
    );
  }
}