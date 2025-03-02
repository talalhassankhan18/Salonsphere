"use server";

import dbConnect from "@/lib/mongoose";
import User from "@/mongoose-models/register";
import { z } from "zod";
import { createSession } from "@/lib/session";

export async function createUser(prevState: unknown, formData: { email: string, password: string, confirmPassword: string, agreeToTerms: string }) {
  const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
    agreeToTerms: z.literal("on"),
  });

  const result = schema.safeParse(formData);

  if (!result.success) {
    return {
      success: false,
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    };
  }

  const { email, password, confirmPassword } = result.data;

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  try {
    await dbConnect();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, message: "User with this email already exists." };
    }

    const user = new User({ email, password, role: "user" }); // ❌ Removed manual hashing
    await user.save();
    await createSession(user.id);

    return { success: true, message: "User registered successfully!" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error creating user" };
  }
}
