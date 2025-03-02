"use server";

import dbConnect from "@/lib/mongoose";
import User from "@/mongoose-models/register";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { createSession, deleteSession } from "@/lib/session";

export async function loginUser(prevState: unknown, formData: { email: string; password: string }) {
  // ✅ Validate Input
  const schema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  });

  const result = schema.safeParse(formData);
  if (!result.success) {
    return { success: false, message: "Invalid email or password format." };
  }

  const { email, password } = result.data;

  try {
    await dbConnect();
    
    // ✅ Find User in Database
    const user = await User.findOne({ email }).select("+password"); // Ensure password field is selected
    if (!user) {
      console.log("❌ User not found:", email);
      return { success: false, message: "Invalid credentials." };
    }

    console.log("🔹 Entered Password:", password);
    console.log("🔹 Stored Hashed Password:", user.password);

    // ✅ Compare Entered Password with Hashed Password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔹 Password Match:", isMatch);

    if (!isMatch) {
      console.log("❌ Incorrect password for:", email);
      return { success: false, message: "Invalid credentials." };
    }

    // ✅ Create Session
    await createSession(user.id);

    console.log("✅ Login successful for:", email);
    return { success: true, message: "Login successful!" };

  } catch (error) {
    console.error("⚠️ Error during login:", error);
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}

// ✅ Logout Function
export async function logoutUser() {
  await deleteSession();
  return { success: true, message: "Logged out successfully!" };
}
