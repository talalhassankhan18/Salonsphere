import dbConnect from '@/dbConnect';
import { connectOr503 } from "@/lib/db-guard";
import Stock from '@/mongoose-models/stock';
import { NextResponse } from 'next/server';
import { requireSuperAdmin } from "@/lib/auth/guards";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const dbError = await connectOr503();
  if (dbError) return dbError;
  const params = await context.params;
  const id = params.id;

  try {
    const stock = await Stock.findById(id)
      .populate('category', 'name')
      .lean();
    if (!stock) {
      return NextResponse.json(
        { success: false, error: 'Stock not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: stock });
  } catch (error) {
    console.error('Error fetching stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stock' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const dbError = await connectOr503();
  if (dbError) return dbError;
  const params = await context.params;
  const id = params.id;

  try {
    const body = await request.json();
    const { productId, stockQuantity, reserved, lowStockThreshold, reorderPoint, warehouse } = body;

    // Require stockQuantity, make others optional
    if (stockQuantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Stock quantity is required' },
        { status: 400 }
      );
    }

    // Fetch current stock to merge with updated fields
    const currentStock = await Stock.findById(id);
    if (!currentStock) {
      return NextResponse.json(
        { success: false, error: 'Stock not found' },
        { status: 404 }
      );
    }

    const updateData = {
      productId: productId !== undefined ? productId : currentStock.productId,
      stockQuantity,
      reserved: reserved !== undefined ? reserved : currentStock.reserved,
      available: stockQuantity - (reserved !== undefined ? reserved : currentStock.reserved),
      lowStockThreshold: lowStockThreshold !== undefined ? lowStockThreshold : currentStock.lowStockThreshold,
      reorderPoint: reorderPoint !== undefined ? reorderPoint : currentStock.reorderPoint,
      warehouse: warehouse !== undefined ? warehouse : currentStock.warehouse,
    };

    const stock = await Stock.findByIdAndUpdate(id, updateData, { new: true })
      .populate('category', 'name')
      .lean();
    if (!stock) {
      return NextResponse.json(
        { success: false, error: 'Stock not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: stock });
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const dbError = await connectOr503();
  if (dbError) return dbError;
  const params = await context.params;
  const id = params.id;

  try {
    const stock = await Stock.findByIdAndDelete(id).lean();
    if (!stock) {
      return NextResponse.json(
        { success: false, error: 'Stock not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Stock deleted' });
  } catch (error) {
    console.error('Error deleting stock:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete stock' },
      { status: 500 }
    );
  }
}