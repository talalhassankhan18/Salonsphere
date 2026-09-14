import { NextResponse } from "next/server";
import { uploadImage } from "@/lib/cloudinary";

// POST /api/upload
// Multipart form with one or more `images` (or a single `file`) fields.
// Returns { imageUrls: string[] } — used by salon registration (profile-setup)
// to upload portfolio images before the salon account exists, so it is not
// tied to a session; limits below keep it from being abused as free storage.

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per image
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export async function POST(req: Request) {
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const files = [...formData.getAll("images"), ...formData.getAll("file")].filter(
    (f): f is File => f instanceof File && f.size > 0
  );

  if (files.length === 0) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json(
      { error: `You can upload at most ${MAX_FILES} images at a time` },
      { status: 400 }
    );
  }

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type || "unknown"}` },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: `${file.name} is larger than ${MAX_BYTES / 1024 / 1024} MB` },
        { status: 413 }
      );
    }
  }

  try {
    const imageUrls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(Buffer.from(await file.arrayBuffer()));
      if (!url) throw new Error(`Upload failed for ${file.name}`);
      imageUrls.push(url);
    }
    // `url` kept for older callers that expect a single value.
    return NextResponse.json({ imageUrls, url: imageUrls[0] });
  } catch (error: any) {
    console.error("Upload error:", error?.message || error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
