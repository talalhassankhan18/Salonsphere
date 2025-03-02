"use server";

import dbConnect from "@/lib/mongoose";
import Vendor from "@/mongoose-models/verify";
import { z } from "zod";
import { createSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { writeFile, mkdir, readdir } from "fs/promises";
import path from "path";
import fs from "fs";

export async function createVendor(prevState: unknown, formData: FormData) {
  const schema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    phoneNumber: z.string().regex(/^\d{10,}$/, "Phone number must be at least 10 digits"),
    businessName: z.string().min(1, "Business Name is required"),
    shopNumber: z.string().min(1, "Shop Number is required"),
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    province: z.string().min(1, "Province is required"),
    area: z.string().min(1, "Area is required"),
    businessRegistrationNumber: z.string().regex(/^SS-\d{4}$/, "Invalid Business Registration Number"),
    termsAccepted: z.literal("on", { required_error: "You must accept the terms" }),
  });

  const parsed = schema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: "Validation error", errors: parsed.error.flatten().fieldErrors };
  }

  await dbConnect();

  const existingVendor = await Vendor.findOne({ email: parsed.data.email });
  if (existingVendor) {
    return { message: "Vendor with this email already exists.", errors: {} };
  }

  const profileImage = formData.get("profileImage") as File | null;
  let profileImageUrl = "";

  if (profileImage && profileImage.size > 0) {
    try {
      const uploadDir = path.join(process.cwd(), "public/uploads");

      if (!fs.existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      const existingFiles = await readdir(uploadDir);
      const profileCount = existingFiles.filter(file => file.startsWith("Profile")).length;
      const imageName = `Profile${profileCount + 1}${path.extname(profileImage.name)}`;
      const imagePath = path.join(uploadDir, imageName);

      await writeFile(imagePath, Buffer.from(await profileImage.arrayBuffer()));
      profileImageUrl = `/uploads/${imageName}`;
    } catch (error) {
      console.error("❌ File upload failed:", error);
      return { message: "File upload failed. Please try again.", errors: {} };
    }
  }

  const vendor = new Vendor({ 
    ...parsed.data, 
    profileImage: profileImageUrl, 
    termsAccepted: true 
  });

  await vendor.save();
  await createSession(vendor.id);

  return redirect("/Subscription");
}
