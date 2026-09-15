import dbConnect from '@/dbConnect';
import { connectOr503 } from "@/lib/db-guard";
import Banner from '@/mongoose-models/banners';
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';
import { requireSuperAdmin } from "@/lib/auth/guards";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const dbError = await connectOr503();
  if (dbError) return dbError;
  const id = params.id;

  try {
    const banner = await Banner.findById(id).lean();
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error('Error fetching banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banner' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const dbError = await connectOr503();
  if (dbError) return dbError;
  const id = params.id;

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const type = formData.get('type') as string;
    const location = formData.get('location') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;
    const priority = parseInt(formData.get('priority') as string);
    const image = formData.get('image') as File | null;

    if (!title || !type || !location || !startDate || !endDate || isNaN(priority)) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      title,
      type,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority,
    };

    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
          { folder: 'banners' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      updateData.imageUrl = (uploadResult as any).secure_url;
    }

    const banner = await Banner.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: banner });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const denied = await requireSuperAdmin();
  if (denied) return denied;

  const dbError = await connectOr503();
  if (dbError) return dbError;
  const id = params.id;

  try {
    const banner = await Banner.findByIdAndDelete(id).lean();
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}