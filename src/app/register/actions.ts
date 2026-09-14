"use server";

import dbConnect from "@/lib/mongoose";
import Register from "@/mongoose-models/register";
import bcrypt from "bcryptjs";

export async function createUser(prevState: any, formData: FormData) {
  await dbConnect();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, message: "Email and password are required" };
  }

  try {
    const existingUser = await Register.findOne({ email });
    if (existingUser) {
      return { success: false, message: "User already exists with this email" };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new Register({
      email,
      password: hashedPassword,
      firstName: "User", // Placeholder or from form if available
      lastName: "User",
    });

    await newUser.save();
    
    return { success: true, message: "Registration successful" };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, message: "An error occurred during registration" };
  }
}
