import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // Mock response (replace with actual file upload logic, e.g., Cloudinary)
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    // Simulate uploaded URL
    return NextResponse.json({ url: `https://example.com/uploads/${Date.now()}.jpg` });
  } catch (error: any) {
    console.error("Upload error:", error.message);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}