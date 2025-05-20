import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(buffer: Buffer): Promise<string | null> {
  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "salon_portfolio" },
        (error, result) => {
          if (error || !result) {
            reject(error || new Error("Failed to upload image"));
          } else {
            resolve(result);
          }
        }
      );
      stream.end(buffer);
    });
    return (result as { secure_url: string }).secure_url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return null;
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary deletion error:", error);
    throw new Error("Failed to delete image from Cloudinary");
  }
}
