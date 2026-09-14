// app/actions.ts
"use server";

import dbConnect from "@/lib/mongoose";
import User from "@/mongoose-models/User";
import { isSuperAdminRequest } from "@/lib/auth/guards";
import bcrypt from "bcryptjs";
import { z } from "zod";

export async function updateUser(
  id: string,
  formData: FormData
): Promise<void> {
  if (!(await isSuperAdminRequest())) {
    throw new Error("Unauthorized: super-admin login required");
  }
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    gender: z.enum(["Male", "Female", "Unisex"]),
    age: z.preprocess(
      (val) => Number.parseInt(val as string, 10),
      z.number().min(0, "Age must be a positive number")
    ),
    city: z.string().min(1, "City is required"),
    area: z.string().min(1, "Area is required"),
  });

  const result = schema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    gender: formData.get("gender"),
    age: formData.get("age"),
    city: formData.get("city"),
    area: formData.get("area"),
  });

  if (!result.success) {
    console.error("Validation failed", result.error);
    return;
  }

  const { name, email, password, gender, age, city, area } = result.data;

  try {
    await dbConnect();

    const existingUser = await User.findById(id);
    if (!existingUser) {
      console.error("User not found");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: id },
      {
        name,
        email,
        password: hashedPassword,
        gender,
        age,
        location: { city, area },
      }
    );
    console.log("User updated successfully");
  } catch (error) {
    console.error("Failed to update user", error);
  }
}
