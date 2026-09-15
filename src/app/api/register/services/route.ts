import { NextResponse } from 'next/server';
import dbConnect from '@/dbConnect';
import { connectOr503 } from "@/lib/db-guard";
import Salon from '@/mongoose-models/Salon';
import { getSession } from 'next-auth/react';

export async function POST(req: Request) {
  const dbError = await connectOr503();
  if (dbError) return dbError;
  
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { services } = await req.json();
    
    const salon = await Salon.findById(session.user.id);
    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 });
    }
    
    salon.services = services.map((s: any) => ({
      name: s.name,
      price: Number(s.price),
      duration: Number(s.duration),
      description: s.description
    }));
    
    await salon.save();
    
    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}