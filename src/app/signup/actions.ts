"use server";

import dbConnect from "@/lib/mongoose";
import Vendor from "@/mongoose-models/Vendor"; // Updated to use Vendor
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession, verifySession } from "@/lib/session.server";
import { redirect } from "next/navigation";
import crypto from "crypto"; // For generating unique registration numbers

export async function createVendor(prevState: unknown, formData: FormData) {
  const schema = z.object({
    firstName: z.string().min(1, "First Name is required"),
    lastName: z.string().min(1, "Last Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    mobileNumber: z
      .string()
      .regex(/^[0-9]+$/, "Mobile number must contain only digits")
      .min(10, "Mobile number must be at least 10 digits"),
    country: z.string().min(1, "Country is required"),
    shopName: z.string().min(1, "Shop Name is required"),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
    agreeToTerms: z.literal("on").refine(
      (value) => value === "on",
      "You must agree to the terms and conditions"
    ),
    registrationNumber: z
      .string()
      .regex(/^GL[A-Z0-9]{12}$/, "Invalid registration number format")
      .optional(), // Mark as optional since it's generated on the backend
  });

  const result = schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    mobileNumber: formData.get("mobileNumber"),
    country: formData.get("country"),
    shopName: formData.get("shopName"),
    city: formData.get("city"),
    area: formData.get("area"),
    agreeToTerms: formData.get("agreeToTerms"),
  });

  if (!result.success) {
    return {
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const {
    firstName,
    lastName,
    email,
    password,
    mobileNumber,
    country,
    shopName,
    city,
    area,
  } = result.data;

  try {
    await dbConnect();

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return { message: "Vendor with this email already exists.", errors: {} };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique business registration number with 'GL' prefix
    const registrationNumber = `GL${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

    // Create new vendor
    const vendor = new Vendor({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobileNumber,
      country,
      shopName,
      city,
      area,
      registrationNumber, // Save the registration number
    });

    await vendor.save();
    await createSession(vendor.id);
  } catch (error) {
    console.error(error);
    return { message: "Error creating vendor", errors: {} };
  }

  return redirect("/login");
}
