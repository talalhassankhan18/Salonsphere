// app/users/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongoose";
import User from "@/mongoose-models/User";
import { isSuperAdminRequest } from "@/lib/auth/guards";

export async function deleteUser(id: string) {
  if (!(await isSuperAdminRequest())) {
    throw new Error("Unauthorized: super-admin login required");
  }
  try {
    // Connect to the database
    await dbConnect();

    // Find and delete the user by ID
    const result = await User.findByIdAndDelete(id);
    if (!result) {
      throw new Error("User not found");
    }

    // Revalidate path to update the user list page
    revalidatePath("/users");

    return { message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return { message: "Failed to delete user", error: errorMessage };
  }
}
