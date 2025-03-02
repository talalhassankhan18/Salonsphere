"use server";
import dbConnect from "@/lib/mongoose";
import UserModel from "@/mongoose-models/register"; 
import ServiceModel from "@/mongoose-models/serviceSelection";

/**
 * Fetch the user ID from the email
 */
export async function getUserIdByEmail(email: string): Promise<string | null> {
  await dbConnect();

  const user = await UserModel.findOne({ email }).lean();
  return user ? String(user._id) : null;
}

/**
 * Save the selected service for the user
 */
export async function saveService(userId: string, service: string) {
  await dbConnect();

  try {
    let userServices = await ServiceModel.findOne({ userId });

    if (!userServices) {
      userServices = new ServiceModel({ userId, services: [service], registrationDate: new Date(), businessStatus: "active" });
    } else {
      if (!userServices.services.includes(service)) {
        userServices.services.push(service);
      }
    }

    await userServices.save();
    return { success: true, message: "Service added successfully" };
  } catch (error) {
    return { success: false, message: "Error adding service" };
  }
}

/**
 * Update business status
 */
export async function updateBusinessStatus(userId: string, status: "active" | "inactive") {
  await dbConnect();

  try {
    await ServiceModel.updateOne({ userId }, { businessStatus: status }, { upsert: true });
    return { success: true, message: "Business status updated successfully" };
  } catch (error) {
    return { success: false, message: "Error updating business status" };
  }
}
