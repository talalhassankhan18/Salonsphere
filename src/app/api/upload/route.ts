import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb", // Increase size limit to 10MB
    },
  },
};

export async function POST(req: NextRequest) {
  try {
    // Parse form data
    const body = await req.formData();
    const file = body.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File size exceeds 10MB" }, { status: 400 });
    }

    // Define upload path
    const uploadDir = path.join(process.cwd(), "public/uploads");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, file.name);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file
    await writeFile(filePath, buffer);

    return NextResponse.json({ message: "File uploaded successfully", url: `/uploads/${file.name}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
