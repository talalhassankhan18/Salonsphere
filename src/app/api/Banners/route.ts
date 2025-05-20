import dbConnect from '@/dbConnect';
import Banner from '@/mongoose-models/banners';
import { NextResponse } from 'next/server';
import cloudinary from 'cloudinary';

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
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { type: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const banners = await Banner.find(query).lean();
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  await dbConnect();
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

    let imageUrl = '';
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
      imageUrl = (uploadResult as any).secure_url;
    }

    const banner = new Banner({
      title,
      type,
      location,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      priority,
      imageUrl,
    });

    await banner.save();
    const populatedBanner = await Banner.findById(banner._id).lean();

    return NextResponse.json({ success: true, data: populatedBanner }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}